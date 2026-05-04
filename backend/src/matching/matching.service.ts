import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { MatchScore } from './match-score.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { Experience } from '../experience/experience.entity.js';
import { Job } from '../job/job.entity.js';
import { MatchFilterService } from './match-filter.service.js';
import { REDIS_CLIENT } from './redis.provider.js';

export interface DevData {
  id: string;
  workModes: string[] | null;
  cityId: number | null;
  maxRadiusKm?: number | null;
  salaryCltMin: number | null;
  salaryCltMax: number | null;
  salaryPjMin: number | null;
  salaryPjMax: number | null;
  skills: { skillId: string; level: string }[];
  totalExperienceMonths: number;
}

export interface JobData {
  id: string;
  workMode: string;
  cityId: number | null;
  cityStateId: number | null;
  maxRadiusKm?: number | null;
  salaryCltMin: number | null;
  salaryCltMax: number | null;
  salaryPjMin: number | null;
  salaryPjMax: number | null;
  contractModel: string;
  seniority: string;
  minExperienceYears: number;
  skills: { skillId: string; minLevel: string; requirement: string }[];
}

interface MatchResult {
  score: number;
  skillScore: number;
  experienceScore: number;
  modalityScore: number;
  salaryScore: number;
  devHash: string;
  jobHash: string;
}

const REDIS_TTL_DEFAULT = 1800;  // 30min — match comum (score < 75 e nao aplicou)
const REDIS_TTL_RELEVANT = 21600; // 6h — match relevante (score >= 75 ou aplicou)
const RELEVANCE_THRESHOLD = 75;
const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert'];

// Compatibility table: [devLevel][jobLevel] → percentage
const LEVEL_COMPAT: Record<string, Record<string, number>> = {
  beginner:     { beginner: 100, intermediate: 70,  advanced: 50,  expert: 30  },
  intermediate: { beginner: 120, intermediate: 100, advanced: 70,  expert: 50  },
  advanced:     { beginner: 150, intermediate: 120, advanced: 100, expert: 70  },
  expert:       { beginner: 150, intermediate: 150, advanced: 120, expert: 100 },
};

const REQ_WEIGHT: Record<string, number> = { required: 3, expected: 2, differential: 1 };

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(MatchScore)
    private readonly matchRepo: Repository<MatchScore>,
    @InjectRepository(JobApplication)
    private readonly applicationRepo: Repository<JobApplication>,
    @InjectRepository(DevProfile)
    private readonly devProfileRepo: Repository<DevProfile>,
    @InjectRepository(DevSkill)
    private readonly devSkillRepo: Repository<DevSkill>,
    @InjectRepository(Experience)
    private readonly experienceRepo: Repository<Experience>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    private readonly matchFilter: MatchFilterService,
  ) {}

  /**
   * Computa e persiste o score para um par especifico (devProfileId, jobId).
   * Carrega DevData/JobData internamente. Util ao se candidatar — garante que
   * o par sempre tenha row em match_scores (relevant via aplicacao).
   * Throws nada — falhas sao logadas e ignoradas (best-effort).
   */
  async getScoreByIds(devProfileId: string, jobId: string): Promise<MatchResult | null> {
    try {
      const [profile, job, skills, experiences] = await Promise.all([
        this.devProfileRepo.findOne({ where: { id: devProfileId } }),
        this.jobRepo.findOne({ where: { id: jobId }, relations: ['skills'] }),
        this.devSkillRepo.find({ where: { devProfileId } }),
        this.experienceRepo.find({ where: { devProfileId } }),
      ]);
      if (!profile || !job) return null;

      const now = new Date();
      let totalMonths = 0;
      for (const exp of experiences) {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent ? now : (exp.endDate ? new Date(exp.endDate) : now);
        totalMonths += Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
      }

      const dev: DevData = {
        id: profile.id,
        workModes: profile.workModes,
        cityId: profile.cityId,
        maxRadiusKm: profile.maxRadiusKm,
        salaryCltMin: profile.salaryCltMin,
        salaryCltMax: profile.salaryCltMax,
        salaryPjMin: profile.salaryPjMin,
        salaryPjMax: profile.salaryPjMax,
        skills: skills.map((s) => ({ skillId: s.skillId, level: s.level })),
        totalExperienceMonths: totalMonths,
      };
      const jobData: JobData = {
        id: job.id,
        workMode: job.workMode,
        cityId: job.cityId,
        cityStateId: null,
        maxRadiusKm: job.maxRadiusKm,
        salaryCltMin: job.salaryCltMin ? Number(job.salaryCltMin) : null,
        salaryCltMax: job.salaryCltMax ? Number(job.salaryCltMax) : null,
        salaryPjMin: job.salaryPjMin ? Number(job.salaryPjMin) : null,
        salaryPjMax: job.salaryPjMax ? Number(job.salaryPjMax) : null,
        contractModel: job.contractModel,
        seniority: job.seniority,
        minExperienceYears: job.minExperienceYears,
        skills: (job.skills ?? []).map((js) => ({
          skillId: js.skillId,
          minLevel: js.minLevel,
          requirement: js.requirement,
        })),
      };

      return await this.getScore(dev, jobData);
    } catch {
      return null;
    }
  }

  // =============================================
  // Public API
  // =============================================

  async getScore(dev: DevData, job: JobData): Promise<MatchResult> {
    const devHash = this.computeDevHash(dev);
    const jobHash = this.computeJobHash(job);
    const redisKey = `match:${dev.id}:${job.id}`;

    // Layer 1: Redis
    const cached = await this.redis.get(redisKey);
    if (cached) {
      const parsed = JSON.parse(cached) as MatchResult;
      if (parsed.devHash === devHash && parsed.jobHash === jobHash) {
        return parsed;
      }
    }

    // Layer 2: PostgreSQL
    const dbRow = await this.matchRepo.findOne({
      where: { devProfileId: dev.id, jobId: job.id },
    });
    if (dbRow && dbRow.devHash === devHash && dbRow.jobHash === jobHash) {
      const result: MatchResult = {
        score: dbRow.score,
        skillScore: Number(dbRow.skillScore),
        experienceScore: Number(dbRow.experienceScore),
        modalityScore: Number(dbRow.modalityScore),
        salaryScore: Number(dbRow.salaryScore),
        devHash,
        jobHash,
      };
      // DB row exists → already proved relevant at last calculation → use long TTL
      await this.redis.set(redisKey, JSON.stringify(result), 'EX', REDIS_TTL_RELEVANT);
      return result;
    }

    // Pre-carrega coords das cidades para o calcModality (necessario para Haversine)
    if (job.workMode !== 'remote' && dev.cityId && job.cityId) {
      await this.matchFilter.preloadCities([dev.cityId, job.cityId]);
    }

    // Calculate
    const result = this.calculate(dev, job, devHash, jobHash);

    // Determine relevance: score >= 75 OR dev applied to this job
    const relevant = await this.isRelevant(dev.id, job.id, result.score);
    const ttl = relevant ? REDIS_TTL_RELEVANT : REDIS_TTL_DEFAULT;

    // Save to Redis with appropriate TTL
    await this.redis.set(redisKey, JSON.stringify(result), 'EX', ttl);

    // Persist or evict from PostgreSQL based on relevance
    await this.persistOrEvict(dev.id, job.id, result, relevant, !!dbRow);

    return result;
  }

  async getScoresBatch(dev: DevData, jobs: JobData[]): Promise<Map<string, MatchResult>> {
    const results = new Map<string, MatchResult>();
    const devHash = this.computeDevHash(dev);

    // Pipeline Redis get
    const pipeline = this.redis.pipeline();
    for (const job of jobs) {
      pipeline.get(`match:${dev.id}:${job.id}`);
    }
    const redisResults = await pipeline.exec();

    const toCalculate: { job: JobData; index: number }[] = [];

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const jobHash = this.computeJobHash(job);
      const [err, cached] = redisResults![i];

      if (!err && cached) {
        const parsed = JSON.parse(cached as string) as MatchResult;
        if (parsed.devHash === devHash && parsed.jobHash === jobHash) {
          results.set(job.id, parsed);
          continue;
        }
      }

      toCalculate.push({ job, index: i });
    }

    if (toCalculate.length === 0) return results;

    // Check PostgreSQL for remaining
    const jobIds = toCalculate.map((t) => t.job.id);
    const dbRows = await this.matchRepo.createQueryBuilder('m')
      .where('m.dev_profile_id = :devId', { devId: dev.id })
      .andWhere('m.job_id IN (:...jobIds)', { jobIds })
      .getMany();

    const dbMap = new Map(dbRows.map((r) => [r.jobId, r]));
    const stillToCalc: { job: JobData; jobHash: string }[] = [];

    for (const { job } of toCalculate) {
      const jobHash = this.computeJobHash(job);
      const dbRow = dbMap.get(job.id);

      if (dbRow && dbRow.devHash === devHash && dbRow.jobHash === jobHash) {
        const result: MatchResult = {
          score: dbRow.score,
          skillScore: Number(dbRow.skillScore),
          experienceScore: Number(dbRow.experienceScore),
          modalityScore: Number(dbRow.modalityScore),
          salaryScore: Number(dbRow.salaryScore),
          devHash,
          jobHash,
        };
        results.set(job.id, result);
        // DB row exists → relevant → long TTL
        await this.redis.set(`match:${dev.id}:${job.id}`, JSON.stringify(result), 'EX', REDIS_TTL_RELEVANT);
      } else {
        stillToCalc.push({ job, jobHash });
      }
    }

    if (stillToCalc.length === 0) return results;

    // Pre-carrega cidades do dev e dos jobs restantes (Haversine no calcModality)
    const cityIds = new Set<number>();
    if (dev.cityId) cityIds.add(dev.cityId);
    for (const { job } of stillToCalc) {
      if (job.workMode !== 'remote' && job.cityId) cityIds.add(job.cityId);
    }
    if (cityIds.size > 0) {
      await this.matchFilter.preloadCities([...cityIds]);
    }

    // Bulk-fetch which of the remaining jobs the dev has applied to (apenas vagas abertas)
    const remainingJobIds = stillToCalc.map((s) => s.job.id);
    const appliedJobs = await this.applicationRepo
      .createQueryBuilder('app')
      .select('app.job_id', 'jobId')
      .innerJoin('jobs', 'j', 'j.id = app.job_id AND j.status = :open', { open: 'open' })
      .where('app.dev_profile_id = :devId', { devId: dev.id })
      .andWhere('app.job_id IN (:...jobIds)', { jobIds: remainingJobIds })
      .getRawMany<{ jobId: string }>();
    const appliedSet = new Set(appliedJobs.map((a) => a.jobId));

    // Calculate remaining
    const savePipeline = this.redis.pipeline();
    for (const { job, jobHash } of stillToCalc) {
      const result = this.calculate(dev, job, devHash, jobHash);
      results.set(job.id, result);

      const relevant = result.score >= RELEVANCE_THRESHOLD || appliedSet.has(job.id);
      const ttl = relevant ? REDIS_TTL_RELEVANT : REDIS_TTL_DEFAULT;
      savePipeline.set(`match:${dev.id}:${job.id}`, JSON.stringify(result), 'EX', ttl);

      const hadDbRow = dbMap.has(job.id);
      await this.persistOrEvict(dev.id, job.id, result, relevant, hadDbRow);
    }
    await savePipeline.exec();

    return results;
  }

  /**
   * Determines if a (dev, job) pair is "relevant" enough to persist.
   * Relevant = score >= 75 OR (dev candidatado E vaga ativa/open).
   */
  private async isRelevant(devProfileId: string, jobId: string, score: number): Promise<boolean> {
    if (score >= RELEVANCE_THRESHOLD) return true;
    const applied = await this.applicationRepo
      .createQueryBuilder('app')
      .innerJoin('jobs', 'j', 'j.id = app.job_id AND j.status = :open', { open: 'open' })
      .where('app.dev_profile_id = :devId AND app.job_id = :jobId', { devId: devProfileId, jobId })
      .select('app.id')
      .getRawOne();
    return !!applied;
  }

  /**
   * Persists the score to PostgreSQL if relevant, or evicts existing row otherwise.
   * - relevant && row exists → upsert
   * - relevant && no row → insert
   * - !relevant && row exists → DELETE (lost relevance)
   * - !relevant && no row → no-op
   */
  private async persistOrEvict(
    devProfileId: string,
    jobId: string,
    result: MatchResult,
    relevant: boolean,
    hadDbRow: boolean,
  ): Promise<void> {
    if (relevant) {
      await this.upsertScore(devProfileId, jobId, result);
    } else if (hadDbRow) {
      await this.matchRepo.delete({ devProfileId, jobId });
    }
  }

  async invalidateDev(devProfileId: string): Promise<void> {
    const keys = await this.redis.keys(`match:${devProfileId}:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async invalidateJob(jobId: string): Promise<void> {
    const keys = await this.redis.keys(`match:*:${jobId}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  // =============================================
  // Persistence
  // =============================================

  private async upsertScore(devProfileId: string, jobId: string, result: MatchResult): Promise<void> {
    await this.matchRepo.query(
      `INSERT INTO match_scores (id, dev_profile_id, job_id, score, dev_hash, job_hash, skill_score, experience_score, modality_score, salary_score, calculated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (dev_profile_id, job_id) DO UPDATE SET
         score = EXCLUDED.score,
         dev_hash = EXCLUDED.dev_hash,
         job_hash = EXCLUDED.job_hash,
         skill_score = EXCLUDED.skill_score,
         experience_score = EXCLUDED.experience_score,
         modality_score = EXCLUDED.modality_score,
         salary_score = EXCLUDED.salary_score,
         calculated_at = now()`,
      [devProfileId, jobId, result.score, result.devHash, result.jobHash,
       result.skillScore, result.experienceScore, result.modalityScore, result.salaryScore],
    );
  }

  // =============================================
  // Algorithm
  // =============================================

  private calculate(dev: DevData, job: JobData, devHash: string, jobHash: string): MatchResult {
    const skillScore = this.calcSkills(dev, job);
    const experienceScore = this.calcExperience(dev, job);
    const modalityScore = this.calcModality(dev, job);
    const salaryScore = this.calcSalary(dev, job);

    const score = Math.round(
      skillScore * 0.50 +
      experienceScore * 0.25 +
      modalityScore * 0.10 +
      salaryScore * 0.15,
    );

    return {
      score: Math.max(0, Math.min(100, score)),
      skillScore: Math.round(skillScore * 100) / 100,
      experienceScore: Math.round(experienceScore * 100) / 100,
      modalityScore: Math.round(modalityScore * 100) / 100,
      salaryScore: Math.round(salaryScore * 100) / 100,
      devHash,
      jobHash,
    };
  }

  private calcSkills(dev: DevData, job: JobData): number {
    if (job.skills.length === 0) return 50;

    const devSkillMap = new Map(dev.skills.map((s) => [s.skillId, s.level]));
    let weightedSum = 0;
    let maxWeighted = 0;

    for (const js of job.skills) {
      const weight = REQ_WEIGHT[js.requirement] ?? 1;
      maxWeighted += 100 * weight;

      const devLevel = devSkillMap.get(js.skillId);
      if (!devLevel) continue;

      const compat = LEVEL_COMPAT[devLevel]?.[js.minLevel] ?? 0;
      weightedSum += Math.min(100, compat) * weight;
    }

    return maxWeighted > 0 ? (weightedSum / maxWeighted) * 100 : 50;
  }

  private calcExperience(dev: DevData, job: JobData): number {
    if (job.minExperienceYears === 0) return 100;

    const devYears = dev.totalExperienceMonths / 12;
    if (devYears >= job.minExperienceYears) return 100;

    return (devYears / job.minExperienceYears) * 100;
  }

  /**
   * Score de modalidade + localizacao (10% do score final).
   *
   * Regras de composicao:
   *  - Vaga remote E dev aceita remote → 100 (Parte A apenas, sem peso de localizacao)
   *  - Vaga remote E dev NAO aceita remote → 0
   *  - Vaga hybrid/onsite → modalidade × 0.25 + localizacao × 0.75
   *
   * Justificativa: vaga remota nao tem componente de distancia.
   * Em vagas presenciais/hibridas, a distancia importa mais que a aceitacao da modalidade.
   *
   * Localizacao usa MatchFilterService.calcLocationScore (Haversine + raio efetivo).
   * Cidades devem ter sido pre-carregadas antes da chamada.
   */
  private calcModality(dev: DevData, job: JobData): number {
    const devModes = dev.workModes;
    const noPreference = !devModes || devModes.length === 0;
    const acceptsMode = noPreference || devModes!.includes(job.workMode);

    // Vaga remota: 100% se aceita, 0% se nao aceita
    if (job.workMode === 'remote') {
      return acceptsMode ? 100 : 0;
    }

    // Vaga hybrid/onsite: modalidade 25% + localizacao 75%
    const modalityPart = acceptsMode ? 100 : 0;
    const locationPart = this.matchFilter.calcLocationScore(dev, job);

    return modalityPart * 0.25 + locationPart * 0.75;
  }

  private calcSalary(dev: DevData, job: JobData): number {
    // Collect comparable salary pairs by matching contract model
    const pairs: { devMin: number; devMax: number; jobMin: number; jobMax: number }[] = [];

    const hasClt = job.contractModel === 'clt' || job.contractModel === 'clt_pj';
    const hasPj = job.contractModel === 'pj' || job.contractModel === 'clt_pj';

    if (hasClt && dev.salaryCltMin && dev.salaryCltMax && job.salaryCltMin && job.salaryCltMax) {
      pairs.push({ devMin: Number(dev.salaryCltMin), devMax: Number(dev.salaryCltMax), jobMin: Number(job.salaryCltMin), jobMax: Number(job.salaryCltMax) });
    }
    if (hasPj && dev.salaryPjMin && dev.salaryPjMax && job.salaryPjMin && job.salaryPjMax) {
      pairs.push({ devMin: Number(dev.salaryPjMin), devMax: Number(dev.salaryPjMax), jobMin: Number(job.salaryPjMin), jobMax: Number(job.salaryPjMax) });
    }

    if (pairs.length === 0) return 50; // neutro — no comparable model

    // Calculate score for each pair, take best
    let best = 0;
    for (const { devMin, devMax, jobMin, jobMax } of pairs) {
      best = Math.max(best, this.calcSalaryPair(devMin, devMax, jobMin, jobMax));
    }
    return best;
  }

  private calcSalaryPair(devMin: number, devMax: number, jobMin: number, jobMax: number): number {
    const overlapStart = Math.max(devMin, jobMin);
    const overlapEnd = Math.min(devMax, jobMax);

    if (overlapStart > overlapEnd) {
      if (devMin > jobMax) return 0;
      if (devMax < jobMin) {
        const bonus = Math.min(10, ((jobMin - devMax) / devMax) * 100);
        return Math.min(110, 100 + bonus);
      }
    }

    const overlap = overlapEnd - overlapStart;
    const range = Math.max(devMax, jobMax) - Math.min(devMin, jobMin);

    if (range === 0) return 100;

    const baseScore = (overlap / range) * 100;

    if (devMin >= jobMin && devMax <= jobMax) {
      const bonus = Math.min(10, ((jobMax - devMax) / devMax) * 50);
      return Math.min(110, baseScore + bonus);
    }

    return baseScore;
  }

  // =============================================
  // Hashing
  // =============================================

  private computeDevHash(dev: DevData): string {
    const skillsSorted = [...dev.skills]
      .sort((a, b) => a.skillId.localeCompare(b.skillId))
      .map((s) => `${s.skillId}:${s.level}`)
      .join(',');

    const modesSorted = (dev.workModes ?? []).sort().join(',');
    const raw = `${dev.id}:${modesSorted}:${dev.cityId}:${dev.maxRadiusKm}:${dev.salaryCltMin}:${dev.salaryCltMax}:${dev.salaryPjMin}:${dev.salaryPjMax}:${skillsSorted}:${dev.totalExperienceMonths}`;
    return createHash('md5').update(raw).digest('hex');
  }

  private computeJobHash(job: JobData): string {
    const skillsSorted = [...job.skills]
      .sort((a, b) => a.skillId.localeCompare(b.skillId))
      .map((s) => `${s.skillId}:${s.minLevel}:${s.requirement}`)
      .join(',');

    const raw = `${job.id}:${job.workMode}:${job.cityId}:${job.maxRadiusKm}:${job.contractModel}:${job.salaryCltMin}:${job.salaryCltMax}:${job.salaryPjMin}:${job.salaryPjMax}:${job.seniority}:${job.minExperienceYears}:${skillsSorted}`;
    return createHash('md5').update(raw).digest('hex');
  }

}
