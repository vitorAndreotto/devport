import { Inject, Injectable } from '@nestjs/common';
import type { DevData, JobData, MatchResult } from './domain/types.js';
import { calcLocationScore, shouldSkip as filterShouldSkip } from './domain/filter-rules.js';
import { calculate } from './domain/score-calculator.js';
import { computeDevHash, computeJobHash } from './domain/hashing.js';
import { RELEVANCE_THRESHOLD } from './domain/constants.js';
import type { MatchScoreRepository, PersistedMatchScore } from './ports/match-score.repository.js';
import type { MatchScoreCache } from './ports/match-score.cache.js';
import type { ApplicationStatusReader } from './ports/application-status.reader.js';
import type { CityGeoLoader } from './ports/city-geo.loader.js';
import type { DevJobDataLoader } from './ports/dev-job-data.loader.js';
import {
  MATCH_SCORE_REPOSITORY,
  MATCH_SCORE_CACHE,
  APPLICATION_STATUS_READER,
  CITY_GEO_LOADER,
  DEV_JOB_DATA_LOADER,
} from './ports/tokens.js';

// Re-export tipos do dominio pra preservar a API publica usada por callers externos
// (controllers, batch consumer, etc.)
export type { DevData, JobData, MatchResult };

/**
 * Orchestrator do dominio de matching. Coordena cache → DB → calculo → persistencia
 * delegando regras puras pra `domain/` e detalhes de infra pras 5 portas.
 *
 * Responsabilidades:
 *  - Resolver o score com tres camadas (Redis → Postgres → calculo)
 *  - Gerenciar relevancia (decide TTL do cache e persistencia/eviction)
 *  - Pre-carregar cidades antes de calcular score de localizacao
 */
@Injectable()
export class MatchingService {
  constructor(
    @Inject(MATCH_SCORE_REPOSITORY)    private readonly repo: MatchScoreRepository,
    @Inject(MATCH_SCORE_CACHE)         private readonly cache: MatchScoreCache,
    @Inject(APPLICATION_STATUS_READER) private readonly applications: ApplicationStatusReader,
    @Inject(CITY_GEO_LOADER)           private readonly cities: CityGeoLoader,
    @Inject(DEV_JOB_DATA_LOADER)       private readonly loader: DevJobDataLoader,
  ) {}

  // =============================================
  // Public API
  // =============================================

  async getScore(dev: DevData, job: JobData): Promise<MatchResult> {
    const devHash = computeDevHash(dev);
    const jobHash = computeJobHash(job);

    // Layer 1: cache
    const cached = await this.cache.get(dev.id, job.id);
    if (cached && cached.devHash === devHash && cached.jobHash === jobHash) {
      return cached;
    }

    // Layer 2: DB
    const persisted = await this.repo.findOne(dev.id, job.id);
    if (persisted && persisted.devHash === devHash && persisted.jobHash === jobHash) {
      const result = this.fromPersisted(persisted);
      // Row em DB → relevant → TTL longo
      await this.cache.set(dev.id, job.id, result, true);
      return result;
    }

    // Layer 3: calcular
    await this.preloadCitiesFor(dev, job);
    const locationScore = calcLocationScore(dev, job, this.cities.asMap());
    const result = calculate(dev, job, devHash, jobHash, locationScore);

    const relevant = await this.isRelevant(dev.id, job.id, result.score);
    await this.cache.set(dev.id, job.id, result, relevant);
    await this.persistOrEvict(dev.id, job.id, result, relevant, !!persisted);

    return result;
  }

  async getScoresBatch(dev: DevData, jobs: JobData[]): Promise<Map<string, MatchResult>> {
    const results = new Map<string, MatchResult>();
    if (jobs.length === 0) return results;

    const devHash = computeDevHash(dev);

    // Layer 1: cache em pipeline
    const cachedItems = await this.cache.getMany(dev.id, jobs.map((j) => j.id));
    const toCalculate: { job: JobData; jobHash: string }[] = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const jobHash = computeJobHash(job);
      const cached = cachedItems[i];
      if (cached && cached.devHash === devHash && cached.jobHash === jobHash) {
        results.set(job.id, cached);
      } else {
        toCalculate.push({ job, jobHash });
      }
    }
    if (toCalculate.length === 0) return results;

    // Layer 2: DB pra remanescentes
    const persisted = await this.repo.findByDevAndJobs(dev.id, toCalculate.map((t) => t.job.id));
    const persistedMap = new Map(persisted.map((p) => [p.jobId, p]));

    const stillToCalc: { job: JobData; jobHash: string }[] = [];
    const cacheRefills: { jobId: string; result: MatchResult; relevant: boolean }[] = [];
    for (const { job, jobHash } of toCalculate) {
      const p = persistedMap.get(job.id);
      if (p && p.devHash === devHash && p.jobHash === jobHash) {
        const result = this.fromPersisted(p);
        results.set(job.id, result);
        cacheRefills.push({ jobId: job.id, result, relevant: true });
      } else {
        stillToCalc.push({ job, jobHash });
      }
    }
    if (cacheRefills.length > 0) await this.cache.setMany(dev.id, cacheRefills);

    if (stillToCalc.length === 0) return results;

    // Layer 3: calcular remanescentes
    const cityIds = new Set<number>();
    if (dev.cityId) cityIds.add(dev.cityId);
    for (const { job } of stillToCalc) {
      if (job.workMode !== 'remote' && job.cityId) cityIds.add(job.cityId);
    }
    if (cityIds.size > 0) await this.cities.preload([...cityIds]);

    const cityMap = this.cities.asMap();

    // Bulk-fetch quais vagas o dev aplicou (e estao abertas)
    const remainingJobIds = stillToCalc.map((s) => s.job.id);
    const appliedSet = await this.applications.filterActiveApplications(dev.id, remainingJobIds);

    const cacheEntries: { jobId: string; result: MatchResult; relevant: boolean }[] = [];
    for (const { job, jobHash } of stillToCalc) {
      const locationScore = calcLocationScore(dev, job, cityMap);
      const result = calculate(dev, job, devHash, jobHash, locationScore);
      results.set(job.id, result);

      const relevant = result.score >= RELEVANCE_THRESHOLD || appliedSet.has(job.id);
      cacheEntries.push({ jobId: job.id, result, relevant });

      const hadDbRow = persistedMap.has(job.id);
      await this.persistOrEvict(dev.id, job.id, result, relevant, hadDbRow);
    }
    await this.cache.setMany(dev.id, cacheEntries);

    return results;
  }

  /**
   * Computa e persiste o score para um par (devProfileId, jobId).
   * Carrega DevData/JobData via loader. Best-effort — retorna null em falha.
   */
  async getScoreByIds(devProfileId: string, jobId: string): Promise<MatchResult | null> {
    try {
      const [dev, job] = await Promise.all([
        this.loader.loadDev(devProfileId),
        this.loader.loadJob(jobId),
      ]);
      if (!dev || !job) return null;
      return await this.getScore(dev, job);
    } catch {
      return null;
    }
  }

  async invalidateDev(devProfileId: string): Promise<void> {
    await this.cache.invalidateDev(devProfileId);
  }

  async invalidateJob(jobId: string): Promise<void> {
    await this.cache.invalidateJob(jobId);
  }

  /**
   * Convenience pra callers que ja tem cidades carregadas em outro contexto
   * (ex: match-filter.service mantem facade publica pra `shouldSkip`).
   */
  shouldSkip(dev: DevData, job: JobData): boolean {
    return filterShouldSkip(dev, job, this.cities.asMap());
  }

  async preloadCities(cityIds: number[]): Promise<void> {
    await this.cities.preload(cityIds);
  }

  // =============================================
  // Internals
  // =============================================

  private async preloadCitiesFor(dev: DevData, job: JobData): Promise<void> {
    if (job.workMode === 'remote') return;
    const ids: number[] = [];
    if (dev.cityId) ids.push(dev.cityId);
    if (job.cityId) ids.push(job.cityId);
    if (ids.length > 0) await this.cities.preload(ids);
  }

  /** Par e relevante se score >= threshold OU dev candidato com vaga aberta. */
  private async isRelevant(devProfileId: string, jobId: string, score: number): Promise<boolean> {
    if (score >= RELEVANCE_THRESHOLD) return true;
    return this.applications.hasActiveApplication(devProfileId, jobId);
  }

  /**
   *  - relevant && row exists → upsert
   *  - relevant && no row     → insert
   *  - !relevant && row exists → DELETE (perdeu relevancia)
   *  - !relevant && no row    → no-op
   */
  private async persistOrEvict(
    devProfileId: string,
    jobId: string,
    result: MatchResult,
    relevant: boolean,
    hadDbRow: boolean,
  ): Promise<void> {
    if (relevant) {
      await this.repo.upsert(devProfileId, jobId, result);
    } else if (hadDbRow) {
      await this.repo.delete(devProfileId, jobId);
    }
  }

  private fromPersisted(p: PersistedMatchScore): MatchResult {
    return {
      score: p.score,
      skillScore: p.skillScore,
      experienceScore: p.experienceScore,
      modalityScore: p.modalityScore,
      salaryScore: p.salaryScore,
      devHash: p.devHash,
      jobHash: p.jobHash,
    };
  }
}
