import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Job as BullJob } from 'bullmq';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { Experience } from '../experience/experience.entity.js';
import { Job } from '../job/job.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { MatchingService, DevData, JobData } from '../matching/matching.service.js';
import { MatchFilterService } from '../matching/match-filter.service.js';
import { MatchBatchPayload } from './match-batch.producer.js';

@Processor('match-batch', {
  concurrency: Number(process.env.MATCH_BATCH_CONCURRENCY ?? 3),
  lockDuration: 300_000,    // 5 min — pares dev x job demoram
  stalledInterval: 60_000,  // checa stall a cada 1 min
  maxStalledCount: 1,
})
export class MatchBatchConsumer extends WorkerHost {
  private readonly logger = new Logger(MatchBatchConsumer.name);

  constructor(
    @InjectRepository(DevProfile)
    private readonly devProfileRepo: Repository<DevProfile>,
    @InjectRepository(DevSkill)
    private readonly devSkillRepo: Repository<DevSkill>,
    @InjectRepository(Experience)
    private readonly experienceRepo: Repository<Experience>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(JobApplication)
    private readonly appRepo: Repository<JobApplication>,
    private readonly matchingService: MatchingService,
    private readonly eliminationService: MatchFilterService,
  ) {
    super();
  }

  /**
   * Carrega o conjunto de pares (devProfileId|jobId) que sao aplicacoes existentes
   * E cuja vaga esta aberta. Esses pares devem ser SEMPRE calculados
   * (bypass do match-filter): dev tem direito ao seu score e a empresa precisa
   * pra analitica. Vagas fechadas/congeladas nao entram no bypass.
   */
  private async loadApplicationKeys(devIds: string[], jobIds: string[]): Promise<Set<string>> {
    if (devIds.length === 0 || jobIds.length === 0) return new Set();
    const apps = await this.appRepo
      .createQueryBuilder('app')
      .select(['app.dev_profile_id AS dev_profile_id', 'app.job_id AS job_id'])
      .innerJoin('jobs', 'j', 'j.id = app.job_id AND j.status = :open', { open: 'open' })
      .where('app.dev_profile_id IN (:...devIds)', { devIds })
      .andWhere('app.job_id IN (:...jobIds)', { jobIds })
      .getRawMany<{ dev_profile_id: string; job_id: string }>();
    return new Set(apps.map((a) => `${a.dev_profile_id}|${a.job_id}`));
  }

  async process(bullJob: BullJob<MatchBatchPayload>): Promise<void> {
    const { type, ids, pair } = bullJob.data;

    if (type === 'pair') {
      if (pair) await this.processPair(pair.devProfileId, pair.jobId);
      return;
    }
    if (type === 'dirty-dev') {
      await this.processDirtyDevs(ids, bullJob);
    } else {
      await this.processDirtyJobs(ids, bullJob);
    }
  }

  /**
   * Calcula e persiste o score para um unico par (dev, job) — disparado quando
   * dev se candidata. A propria MatchingService.getScoreByIds carrega DevData/JobData
   * e roda persistOrEvict (relevante porque tem application + job aberta).
   */
  private async processPair(devProfileId: string, jobId: string): Promise<void> {
    this.logger.debug(`Processing pair ${devProfileId} x ${jobId}`);
    const result = await this.matchingService.getScoreByIds(devProfileId, jobId);
    if (result == null) {
      this.logger.warn(`Pair ${devProfileId} x ${jobId} could not be computed (missing dev or job)`);
    }
  }

  private async extendLock(bullJob: BullJob): Promise<void> {
    const token = bullJob.token;
    if (!token) return;
    try {
      await bullJob.extendLock(token, 300_000);
    } catch (err) {
      this.logger.warn(`Failed to extend lock for job ${bullJob.id}: ${(err as Error).message}`);
    }
  }

  private async processDirtyDevs(devIds: string[], bullJob: BullJob): Promise<void> {
    this.logger.debug(`Processing ${devIds.length} dirty devs`);

    const devDataMap = await this.loadDevDataBulk(devIds);

    const pageSize = 200;
    let offset = 0;
    let calculated = 0;
    let eliminated = 0;

    while (true) {
      const jobs = await this.jobRepo.find({
        where: { status: 'open' },
        relations: ['skills'],
        take: pageSize,
        skip: offset,
      });

      if (jobs.length === 0) break;

      // Preload cities for elimination filter
      const jobCityIds = jobs.map((j) => j.cityId).filter((id): id is number => id != null);
      const devCityIds = [...devDataMap.values()].map((d) => d.cityId).filter((id): id is number => id != null);
      await this.eliminationService.preloadCities([...jobCityIds, ...devCityIds]);

      // Pares (dev|job) com aplicacao — bypass do filter
      const appKeys = await this.loadApplicationKeys(devIds, jobs.map((j) => j.id));

      for (const job of jobs) {
        const jobData = this.toJobData(job);
        for (const [, devData] of devDataMap) {
          const isApplicant = appKeys.has(`${devData.id}|${job.id}`);
          if (!isApplicant && this.eliminationService.shouldSkip(devData, jobData)) {
            eliminated++;
            continue;
          }
          await this.matchingService.getScore(devData, jobData);
          calculated++;
        }
      }

      offset += pageSize;
      await this.extendLock(bullJob);
      if (jobs.length < pageSize) break;
    }

    this.logger.debug(`Dirty devs done: ${calculated} calculated, ${eliminated} eliminated`);
  }

  private async processDirtyJobs(jobIds: string[], bullJob: BullJob): Promise<void> {
    this.logger.debug(`Processing ${jobIds.length} dirty jobs`);

    const jobs = await this.jobRepo.find({
      where: { id: In(jobIds) },
      relations: ['skills'],
    });

    const jobDataList = jobs.map((j) => this.toJobData(j));

    // Preload job cities
    const jobCityIds = jobDataList.map((j) => j.cityId).filter((id): id is number => id != null);
    await this.eliminationService.preloadCities(jobCityIds);

    const pageSize = 200;
    let offset = 0;
    let calculated = 0;
    let eliminated = 0;

    while (true) {
      const devPage = await this.devProfileRepo.find({
        select: ['id'],
        take: pageSize,
        skip: offset,
      });

      if (devPage.length === 0) break;

      const devIds = devPage.map((d) => d.id);
      const devDataMap = await this.loadDevDataBulk(devIds);

      // Preload dev cities
      const devCityIds = [...devDataMap.values()].map((d) => d.cityId).filter((id): id is number => id != null);
      await this.eliminationService.preloadCities(devCityIds);

      // Pares (dev|job) com aplicacao — bypass do filter
      const appKeys = await this.loadApplicationKeys(devIds, jobIds);

      for (const jobData of jobDataList) {
        for (const [, devData] of devDataMap) {
          const isApplicant = appKeys.has(`${devData.id}|${jobData.id}`);
          if (!isApplicant && this.eliminationService.shouldSkip(devData, jobData)) {
            eliminated++;
            continue;
          }
          await this.matchingService.getScore(devData, jobData);
          calculated++;
        }
      }

      offset += pageSize;
      await this.extendLock(bullJob);
      if (devPage.length < pageSize) break;
    }

    this.logger.debug(`Dirty jobs done: ${calculated} calculated, ${eliminated} eliminated`);
  }

  private toJobData(job: Job): JobData {
    return {
      id: job.id,
      workMode: job.workMode,
      cityId: job.cityId,
      cityStateId: null,
      salaryCltMin: job.salaryCltMin ? Number(job.salaryCltMin) : null,
      salaryCltMax: job.salaryCltMax ? Number(job.salaryCltMax) : null,
      salaryPjMin: job.salaryPjMin ? Number(job.salaryPjMin) : null,
      salaryPjMax: job.salaryPjMax ? Number(job.salaryPjMax) : null,
      maxRadiusKm: job.maxRadiusKm,
      contractModel: job.contractModel,
      seniority: job.seniority,
      minExperienceYears: job.minExperienceYears,
      skills: (job.skills ?? []).map((js) => ({
        skillId: js.skillId,
        minLevel: js.minLevel,
        requirement: js.requirement,
      })),
    };
  }

  private async loadDevDataBulk(devIds: string[]): Promise<Map<string, DevData>> {
    const map = new Map<string, DevData>();
    if (devIds.length === 0) return map;

    const profiles = await this.devProfileRepo.find({
      where: { id: In(devIds) },
    });

    const allSkills = await this.devSkillRepo.find({
      where: { devProfileId: In(devIds) },
    });

    const allExperiences = await this.experienceRepo.find({
      where: { devProfileId: In(devIds) },
    });

    const skillsByDev = new Map<string, typeof allSkills>();
    for (const s of allSkills) {
      const arr = skillsByDev.get(s.devProfileId) ?? [];
      arr.push(s);
      skillsByDev.set(s.devProfileId, arr);
    }

    const expsByDev = new Map<string, typeof allExperiences>();
    for (const e of allExperiences) {
      const arr = expsByDev.get(e.devProfileId) ?? [];
      arr.push(e);
      expsByDev.set(e.devProfileId, arr);
    }

    const now = new Date();

    for (const profile of profiles) {
      const skills = skillsByDev.get(profile.id) ?? [];
      const experiences = expsByDev.get(profile.id) ?? [];

      let totalMonths = 0;
      for (const exp of experiences) {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent ? now : (exp.endDate ? new Date(exp.endDate) : now);
        totalMonths += Math.max(
          0,
          (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth()),
        );
      }

      map.set(profile.id, {
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
      });
    }

    return map;
  }
}
