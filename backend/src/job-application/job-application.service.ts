import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobApplication } from './job-application.entity.js';
import { Job } from '../job/job.entity.js';

@Injectable()
export class JobApplicationService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly appRepo: Repository<JobApplication>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
  ) {}

  async apply(devProfileId: string, jobId: string): Promise<JobApplication> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    if (job.status !== 'open') {
      throw new UnprocessableEntityException('Vaga não está aberta para candidaturas.');
    }

    const existing = await this.appRepo.findOne({ where: { devProfileId, jobId } });
    if (existing) {
      throw new ConflictException('Você já se candidatou a esta vaga.');
    }

    const application = this.appRepo.create({
      devProfileId,
      jobId,
      status: 'pending',
    });

    return this.appRepo.save(application);
  }

  async withdraw(devProfileId: string, applicationId: string): Promise<JobApplication> {
    const app = await this.findOwnedOrFail(applicationId, devProfileId);
    if (app.status !== 'pending') {
      throw new UnprocessableEntityException('Apenas candidaturas pendentes podem ser retiradas.');
    }
    app.status = 'withdrawn';
    return this.appRepo.save(app);
  }

  async findByDevProfile(devProfileId: string): Promise<JobApplication[]> {
    return this.appRepo.find({
      where: { devProfileId },
      relations: ['job', 'job.companyProfile', 'job.skills', 'job.skills.skill'],
      order: { createdAt: 'DESC' },
    });
  }

  async findApplicationForJob(devProfileId: string, jobId: string): Promise<JobApplication | null> {
    return this.appRepo.findOne({ where: { devProfileId, jobId } });
  }

  // --- Company-side ---

  async findByJob(jobId: string): Promise<JobApplication[]> {
    return this.appRepo.find({
      where: { jobId },
      relations: ['devProfile'],
      order: { createdAt: 'DESC' },
    });
  }

  async accept(companyProfileId: string, applicationId: string): Promise<JobApplication> {
    const app = await this.findForCompanyOrFail(applicationId, companyProfileId);
    if (app.status !== 'pending') {
      throw new UnprocessableEntityException('Apenas candidaturas pendentes podem ser aceitas.');
    }
    app.status = 'accepted';
    return this.appRepo.save(app);
  }

  async reject(companyProfileId: string, applicationId: string): Promise<JobApplication> {
    const app = await this.findForCompanyOrFail(applicationId, companyProfileId);
    if (app.status !== 'pending') {
      throw new UnprocessableEntityException('Apenas candidaturas pendentes podem ser rejeitadas.');
    }
    app.status = 'rejected';
    return this.appRepo.save(app);
  }

  private async findOwnedOrFail(applicationId: string, devProfileId: string): Promise<JobApplication> {
    const app = await this.appRepo.findOne({ where: { id: applicationId } });
    if (!app || app.devProfileId !== devProfileId) {
      throw new NotFoundException('Candidatura não encontrada.');
    }
    return app;
  }

  private async findForCompanyOrFail(applicationId: string, companyProfileId: string): Promise<JobApplication> {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: ['job'],
    });
    if (!app) {
      throw new NotFoundException('Candidatura não encontrada.');
    }
    if (app.job.companyProfileId !== companyProfileId) {
      throw new NotFoundException('Candidatura não encontrada.');
    }
    return app;
  }
}
