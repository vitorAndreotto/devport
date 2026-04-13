import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './job.entity.js';
import { JobSkill } from './job-skill.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    @InjectRepository(JobSkill)
    private readonly jobSkillRepo: Repository<JobSkill>,
    @InjectRepository(JobApplication)
    private readonly appRepo: Repository<JobApplication>,
  ) {}

  async findByCompanyProfileId(companyProfileId: string): Promise<Job[]> {
    return this.jobRepo.find({
      where: { companyProfileId },
      relations: ['skills', 'skills.skill'],
      order: { status: 'ASC', createdAt: 'DESC' },
    });
  }

  async searchPublic(filters: {
    q?: string;
    work_mode?: string;
    contract_model?: string;
    seniority?: string;
    city_id?: number;
    skills?: { skill_id: string; min_level?: string }[];
    page?: number;
    limit?: number;
  }): Promise<{ data: Job[]; meta: { current_page: number; limit: number; total: number; last_page: number } }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 15));

    // Query 1: get filtered+paginated IDs only (no joins that cause OneToMany issues)
    const idsQb = this.jobRepo.createQueryBuilder('job')
      .select('job.id')
      .where('job.status = :status', { status: 'open' });

    if (filters.q) {
      idsQb.andWhere('(job.title ILIKE :q OR job.description ILIKE :q)', { q: `%${filters.q}%` });
    }
    if (filters.work_mode) {
      idsQb.andWhere('job.work_mode = :workMode', { workMode: filters.work_mode });
    }
    if (filters.contract_model) {
      idsQb.andWhere('job.contract_model = :contractModel', { contractModel: filters.contract_model });
    }
    if (filters.seniority) {
      idsQb.andWhere('job.seniority = :seniority', { seniority: filters.seniority });
    }
    if (filters.city_id) {
      idsQb.andWhere('job.city_id = :cityId', { cityId: filters.city_id });
    }
    if (filters.skills?.length) {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert'];
      for (let i = 0; i < filters.skills.length; i++) {
        const sf = filters.skills[i];
        const alias = `sf${i}`;
        let subSql = `EXISTS (SELECT 1 FROM job_skills ${alias} WHERE ${alias}.job_id = job.id AND ${alias}.skill_id = :${alias}_id`;
        idsQb.setParameter(`${alias}_id`, sf.skill_id);

        if (sf.min_level && levels.includes(sf.min_level)) {
          const minIdx = levels.indexOf(sf.min_level);
          const validLevels = levels.slice(minIdx);
          subSql += ` AND ${alias}.min_level IN (:...${alias}_levels)`;
          idsQb.setParameter(`${alias}_levels`, validLevels);
        }

        subSql += ')';
        idsQb.andWhere(subSql);
      }
    }

    idsQb.orderBy('job.created_at', 'DESC');

    const total = await idsQb.getCount();
    const last_page = Math.ceil(total / limit) || 1;

    idsQb.offset((page - 1) * limit).limit(limit);

    const idRows = await idsQb.getRawMany<{ job_id: string }>();
    const ids = idRows.map((r) => r.job_id);

    if (ids.length === 0) {
      return { data: [], meta: { current_page: page, limit, total, last_page } };
    }

    // Query 2: load full entities with relations for the paginated IDs
    const data = await this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.skills', 'js')
      .leftJoinAndSelect('js.skill', 'skill')
      .leftJoinAndSelect('job.companyProfile', 'company')
      .leftJoinAndSelect('job.city', 'city')
      .leftJoinAndSelect('city.state', 'state')
      .whereInIds(ids)
      .orderBy('job.created_at', 'DESC')
      .getMany();

    return {
      data,
      meta: { current_page: page, limit, total, last_page },
    };
  }

  async findPublicById(jobId: string): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['skills', 'skills.skill', 'companyProfile', 'city', 'city.state'],
    });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    return job;
  }

  async countApplications(jobId: string): Promise<number> {
    return this.appRepo.count({ where: { jobId } });
  }

  async create(companyProfileId: string, dto: CreateJobDto): Promise<Job> {
    this.validateAddress(dto);

    const job = this.jobRepo.create({
      companyProfileId,
      companyUnitId: dto.company_unit_id ?? null,
      title: dto.title,
      description: dto.description,
      seniority: dto.seniority,
      minExperienceYears: dto.min_experience_years,
      contractModel: dto.contract_model,
      salaryMin: dto.salary_min,
      salaryMax: dto.salary_max,
      showSalary: dto.show_salary ?? false,
      benefits: dto.benefits ?? null,
      workMode: dto.work_mode,
      cityId: dto.city_id ?? null,
      zipCode: dto.zip_code ?? null,
      street: dto.street ?? null,
      neighborhood: dto.neighborhood ?? null,
      number: dto.number ?? null,
      complement: dto.complement ?? null,
      status: 'open',
    });

    const saved = await this.jobRepo.save(job);

    await this.syncSkills(saved.id, dto.skills);

    return this.findOneWithSkills(saved.id);
  }

  async update(companyProfileId: string, jobId: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.findOwnedOrFail(jobId, companyProfileId);

    const workMode = dto.work_mode ?? job.workMode;
    if (['onsite', 'hybrid'].includes(workMode)) {
      const cityId = dto.city_id !== undefined ? dto.city_id : job.cityId;
      if (!cityId) {
        throw new UnprocessableEntityException('Endereço obrigatório para vagas presenciais ou híbridas.');
      }
    }

    const updateData: Partial<Job> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.seniority !== undefined) updateData.seniority = dto.seniority;
    if (dto.min_experience_years !== undefined) updateData.minExperienceYears = dto.min_experience_years;
    if (dto.contract_model !== undefined) updateData.contractModel = dto.contract_model;
    if (dto.salary_min !== undefined) updateData.salaryMin = dto.salary_min;
    if (dto.salary_max !== undefined) updateData.salaryMax = dto.salary_max;
    if (dto.show_salary !== undefined) updateData.showSalary = dto.show_salary;
    if (dto.benefits !== undefined) updateData.benefits = dto.benefits ?? null;
    if (dto.work_mode !== undefined) updateData.workMode = dto.work_mode;
    if (dto.company_unit_id !== undefined) updateData.companyUnitId = dto.company_unit_id ?? null;
    if (dto.city_id !== undefined) updateData.cityId = dto.city_id ?? null;
    if (dto.zip_code !== undefined) updateData.zipCode = dto.zip_code ?? null;
    if (dto.street !== undefined) updateData.street = dto.street ?? null;
    if (dto.neighborhood !== undefined) updateData.neighborhood = dto.neighborhood ?? null;
    if (dto.number !== undefined) updateData.number = dto.number ?? null;
    if (dto.complement !== undefined) updateData.complement = dto.complement ?? null;

    if (Object.keys(updateData).length > 0) {
      await this.jobRepo.update(job.id, updateData);
    }

    if (dto.skills !== undefined) {
      await this.syncSkills(job.id, dto.skills);
    }

    return this.findOneWithSkills(job.id);
  }

  async close(companyProfileId: string, jobId: string): Promise<Job> {
    const job = await this.findOwnedOrFail(jobId, companyProfileId);
    if (job.status === 'closed') {
      throw new UnprocessableEntityException('Vaga já está fechada.');
    }
    await this.jobRepo.update(job.id, { status: 'closed' });
    return this.findOneWithSkills(job.id);
  }

  async reopen(companyProfileId: string, jobId: string): Promise<Job> {
    const job = await this.findOwnedOrFail(jobId, companyProfileId);
    if (job.status === 'open') {
      throw new UnprocessableEntityException('Vaga já está aberta.');
    }
    await this.jobRepo.update(job.id, { status: 'open' });
    return this.findOneWithSkills(job.id);
  }

  async remove(companyProfileId: string, jobId: string): Promise<void> {
    const job = await this.findOwnedOrFail(jobId, companyProfileId);
    await this.jobRepo.remove(job);
  }

  private async findOwnedOrFail(jobId: string, companyProfileId: string): Promise<Job> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    if (job.companyProfileId !== companyProfileId) {
      throw new ForbiddenException('Sem permissão para acessar esta vaga.');
    }
    return job;
  }

  private async findOneWithSkills(jobId: string): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['skills', 'skills.skill'],
    });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    return job;
  }

  private async syncSkills(jobId: string, skills: { skill_id: string; min_level: string; requirement?: string }[]): Promise<void> {
    await this.jobSkillRepo.delete({ jobId });

    const entities = skills.map((s) =>
      this.jobSkillRepo.create({
        jobId,
        skillId: s.skill_id,
        minLevel: s.min_level,
        requirement: s.requirement ?? 'required',
      }),
    );

    await this.jobSkillRepo.save(entities);
  }

  private validateAddress(dto: CreateJobDto): void {
    if (['onsite', 'hybrid'].includes(dto.work_mode) && !dto.city_id) {
      throw new UnprocessableEntityException('Endereço obrigatório para vagas presenciais ou híbridas.');
    }
  }
}
