import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevProfile } from '../../dev-profile/dev-profile.entity.js';
import { DevSkill } from '../../dev-skill/dev-skill.entity.js';
import { Experience } from '../../experience/experience.entity.js';
import { Job } from '../../job/job.entity.js';
import { DevJobDataLoader } from '../ports/dev-job-data.loader.js';
import { DevData, JobData } from '../domain/types.js';

/**
 * Adapter TypeORM para DevJobDataLoader — carrega DevData/JobData a partir de IDs.
 * Encapsula o conhecimento das relacoes (skills, experiences, etc.) usado pelo
 * dominio.
 */
@Injectable()
export class TypeOrmDevJobDataLoader implements DevJobDataLoader {
  constructor(
    @InjectRepository(DevProfile) private readonly devProfileRepo: Repository<DevProfile>,
    @InjectRepository(DevSkill)   private readonly devSkillRepo:   Repository<DevSkill>,
    @InjectRepository(Experience) private readonly experienceRepo: Repository<Experience>,
    @InjectRepository(Job)        private readonly jobRepo:        Repository<Job>,
  ) {}

  async loadDev(devProfileId: string): Promise<DevData | null> {
    const [profile, skills, experiences] = await Promise.all([
      this.devProfileRepo.findOne({ where: { id: devProfileId } }),
      this.devSkillRepo.find({ where: { devProfileId } }),
      this.experienceRepo.find({ where: { devProfileId } }),
    ]);
    if (!profile) return null;

    const now = new Date();
    let totalMonths = 0;
    for (const exp of experiences) {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? now : (exp.endDate ? new Date(exp.endDate) : now);
      totalMonths += Math.max(
        0,
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()),
      );
    }

    return {
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
  }

  async loadJob(jobId: string): Promise<JobData | null> {
    const job = await this.jobRepo.findOne({ where: { id: jobId }, relations: ['skills'] });
    if (!job) return null;
    return {
      id: job.id,
      workMode: job.workMode,
      cityId: job.cityId,
      cityStateId: null,
      maxRadiusKm: job.maxRadiusKm,
      salaryCltMin: job.salaryCltMin ? Number(job.salaryCltMin) : null,
      salaryCltMax: job.salaryCltMax ? Number(job.salaryCltMax) : null,
      salaryPjMin:  job.salaryPjMin  ? Number(job.salaryPjMin)  : null,
      salaryPjMax:  job.salaryPjMax  ? Number(job.salaryPjMax)  : null,
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
}
