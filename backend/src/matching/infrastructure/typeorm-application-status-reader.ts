import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from '../../job-application/job-application.entity.js';
import { ApplicationStatusReader } from '../ports/application-status.reader.js';

/**
 * Adapter TypeORM para ApplicationStatusReader — verifica se o dev tem
 * candidatura ativa numa vaga aberta. JOIN com jobs pra garantir que vaga
 * fechada/congelada NAO conta (regra de negocio).
 */
@Injectable()
export class TypeOrmApplicationStatusReader implements ApplicationStatusReader {
  constructor(
    @InjectRepository(JobApplication)
    private readonly appRepo: Repository<JobApplication>,
  ) {}

  async hasActiveApplication(devProfileId: string, jobId: string): Promise<boolean> {
    const row = await this.appRepo
      .createQueryBuilder('app')
      .innerJoin('jobs', 'j', 'j.id = app.job_id AND j.status = :open', { open: 'open' })
      .where('app.dev_profile_id = :devId AND app.job_id = :jobId', { devId: devProfileId, jobId })
      .select('app.id')
      .getRawOne();
    return !!row;
  }

  async filterActiveApplications(devProfileId: string, jobIds: string[]): Promise<Set<string>> {
    if (jobIds.length === 0) return new Set();
    const rows = await this.appRepo
      .createQueryBuilder('app')
      .innerJoin('jobs', 'j', 'j.id = app.job_id AND j.status = :open', { open: 'open' })
      .where('app.dev_profile_id = :devId', { devId: devProfileId })
      .andWhere('app.job_id IN (:...jobIds)', { jobIds })
      .select('app.job_id', 'jobId')
      .getRawMany<{ jobId: string }>();
    return new Set(rows.map((r) => r.jobId));
  }
}
