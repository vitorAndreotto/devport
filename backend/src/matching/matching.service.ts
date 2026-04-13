import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import Redis from 'ioredis';
import { MatchScore } from './match-score.entity.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { Job } from '../job/job.entity.js';
import { REDIS_CLIENT } from './redis.provider.js';

interface DevData {
  id: string;
  workModes: string[] | null;
  cityId: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: { skillId: string; level: string }[];
  totalExperienceMonths: number;
}

interface JobData {
  id: string;
  workMode: string;
  cityId: number | null;
  cityStateId: number | null;
  salaryMin: number;
  salaryMax: number;
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

const REDIS_TTL = 86400; // 24h
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
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

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
      await this.redis.set(redisKey, JSON.stringify(result), 'EX', REDIS_TTL);
      return result;
    }

    // Calculate
    const result = this.calculate(dev, job, devHash, jobHash);

    // Save to Redis
    await this.redis.set(redisKey, JSON.stringify(result), 'EX', REDIS_TTL);

    // Upsert to PostgreSQL
    if (dbRow) {
      await this.matchRepo.update(dbRow.id, {
        score: result.score,
        devHash: result.devHash,
        jobHash: result.jobHash,
        skillScore: result.skillScore,
        experienceScore: result.experienceScore,
        modalityScore: result.modalityScore,
        salaryScore: result.salaryScore,
        calculatedAt: new Date(),
      });
    } else {
      await this.matchRepo.save(this.matchRepo.create({
        devProfileId: dev.id,
        jobId: job.id,
        score: result.score,
        devHash: result.devHash,
        jobHash: result.jobHash,
        skillScore: result.skillScore,
        experienceScore: result.experienceScore,
        modalityScore: result.modalityScore,
        salaryScore: result.salaryScore,
      }));
    }

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
        await this.redis.set(`match:${dev.id}:${job.id}`, JSON.stringify(result), 'EX', REDIS_TTL);
      } else {
        stillToCalc.push({ job, jobHash });
      }
    }

    // Calculate remaining
    const savePipeline = this.redis.pipeline();
    for (const { job, jobHash } of stillToCalc) {
      const result = this.calculate(dev, job, devHash, jobHash);
      results.set(job.id, result);
      savePipeline.set(`match:${dev.id}:${job.id}`, JSON.stringify(result), 'EX', REDIS_TTL);

      const existing = dbMap.get(job.id);
      if (existing) {
        await this.matchRepo.update(existing.id, {
          score: result.score, devHash, jobHash,
          skillScore: result.skillScore, experienceScore: result.experienceScore,
          modalityScore: result.modalityScore, salaryScore: result.salaryScore,
          calculatedAt: new Date(),
        });
      } else {
        await this.matchRepo.save(this.matchRepo.create({
          devProfileId: dev.id, jobId: job.id,
          score: result.score, devHash, jobHash,
          skillScore: result.skillScore, experienceScore: result.experienceScore,
          modalityScore: result.modalityScore, salaryScore: result.salaryScore,
        }));
      }
    }
    await savePipeline.exec();

    return results;
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

  private calcModality(dev: DevData, job: JobData): number {
    // Part A — Modality (50%): job work_mode in dev's work_modes array?
    const devModes = dev.workModes;
    let modalityPart: number;
    if (!devModes || devModes.length === 0) {
      modalityPart = 100; // no preference = accepts all
    } else {
      modalityPart = devModes.includes(job.workMode) ? 100 : 0;
    }

    // Part B — Location (50%)
    let locationPart: number;
    if (job.workMode === 'remote') {
      locationPart = 100; // remote = location doesn't matter
    } else {
      // onsite/hybrid: compare cities
      if (!dev.cityId || !job.cityId) {
        locationPart = 50; // dev has no city = neutral
      } else if (dev.cityId === job.cityId) {
        locationPart = 100;
      } else if (job.cityStateId && this.sameState(dev.cityId, job.cityId, job.cityStateId)) {
        locationPart = 50;
      } else {
        locationPart = 0;
      }
    }

    return modalityPart * 0.5 + locationPart * 0.5;
  }

  private calcSalary(dev: DevData, job: JobData): number {
    if (!dev.salaryMin || !dev.salaryMax) return 50; // neutro

    const devMin = Number(dev.salaryMin);
    const devMax = Number(dev.salaryMax);
    const jobMin = Number(job.salaryMin);
    const jobMax = Number(job.salaryMax);

    const overlapStart = Math.max(devMin, jobMin);
    const overlapEnd = Math.min(devMax, jobMax);

    if (overlapStart > overlapEnd) {
      // No overlap
      if (devMin > jobMax) return 0;   // Dev wants more than job pays
      if (devMax < jobMin) {
        // Job pays more than dev asks — bonus up to 110%
        const bonus = Math.min(10, ((jobMin - devMax) / devMax) * 100);
        return Math.min(110, 100 + bonus);
      }
    }

    const overlap = overlapEnd - overlapStart;
    const range = Math.max(devMax, jobMax) - Math.min(devMin, jobMin);

    if (range === 0) return 100;

    const baseScore = (overlap / range) * 100;

    // If dev's range is fully within job's range, bonus
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
    const raw = `${dev.id}:${modesSorted}:${dev.cityId}:${dev.salaryMin}:${dev.salaryMax}:${skillsSorted}:${dev.totalExperienceMonths}`;
    return createHash('md5').update(raw).digest('hex');
  }

  private computeJobHash(job: JobData): string {
    const skillsSorted = [...job.skills]
      .sort((a, b) => a.skillId.localeCompare(b.skillId))
      .map((s) => `${s.skillId}:${s.minLevel}:${s.requirement}`)
      .join(',');

    const raw = `${job.id}:${job.workMode}:${job.cityId}:${job.salaryMin}:${job.salaryMax}:${job.seniority}:${job.minExperienceYears}:${skillsSorted}`;
    return createHash('md5').update(raw).digest('hex');
  }

  private sameState(_devCityId: number, _jobCityId: number, _jobStateId: number): boolean {
    // In the MVP we compare city_id directly.
    // State comparison would require loading city.state_id for the dev.
    // For now, different city = different state (conservative).
    // TODO: load dev city state_id for proper state comparison
    return false;
  }
}
