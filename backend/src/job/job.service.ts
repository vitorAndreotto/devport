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

  async searchOwned(filters: {
    company_profile_id: string;
    status?: 'open' | 'frozen' | 'closed';
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: (Job & {
      application_count: number;
      applicants_avg_score: number | null;
      top_devs_avg_score: number | null;
    })[];
    meta: { current_page: number; limit: number; total: number; last_page: number };
  }> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 10));

    const idsQb = this.jobRepo.createQueryBuilder('job')
      .select('job.id')
      .where('job.company_profile_id = :cpid', { cpid: filters.company_profile_id });

    if (filters.status) {
      idsQb.andWhere('job.status = :status', { status: filters.status });
    }
    if (filters.q) {
      idsQb.andWhere('(job.title ILIKE :q OR job.description ILIKE :q)', { q: `%${filters.q}%` });
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

    const data = await this.jobRepo.createQueryBuilder('job')
      .leftJoinAndSelect('job.skills', 'js')
      .leftJoinAndSelect('js.skill', 'skill')
      .leftJoinAndSelect('job.city', 'city')
      .leftJoinAndSelect('city.state', 'state')
      .whereInIds(ids)
      .orderBy('job.created_at', 'DESC')
      .getMany();

    // Stats agregadas em uma unica query
    const stats = await this.jobRepo.query(`
      WITH targets AS (SELECT unnest($1::uuid[]) as id),
      app_counts AS (
        SELECT job_id, COUNT(*)::int as c
        FROM job_applications
        WHERE job_id = ANY($1)
        GROUP BY job_id
      ),
      applicants AS (
        SELECT ja.job_id, ROUND(AVG(ms.score)::numeric, 1) as avg_score
        FROM job_applications ja
        JOIN match_scores ms ON ms.job_id = ja.job_id AND ms.dev_profile_id = ja.dev_profile_id
        WHERE ja.job_id = ANY($1)
        GROUP BY ja.job_id
      ),
      ranked AS (
        SELECT ms.job_id, ms.score,
          ROW_NUMBER() OVER (PARTITION BY ms.job_id ORDER BY ms.score DESC) as rn
        FROM match_scores ms
        WHERE ms.job_id = ANY($1)
      ),
      top_devs AS (
        SELECT job_id, ROUND(AVG(score)::numeric, 1) as avg_score
        FROM ranked
        WHERE rn <= 50
        GROUP BY job_id
      )
      SELECT t.id,
        COALESCE(ac.c, 0) as application_count,
        a.avg_score as applicants_avg,
        td.avg_score as top_devs_avg
      FROM targets t
      LEFT JOIN app_counts ac ON ac.job_id = t.id
      LEFT JOIN applicants a ON a.job_id = t.id
      LEFT JOIN top_devs td ON td.job_id = t.id
    `, [ids]);

    const statsMap = new Map<string, { c: number; ap: number | null; td: number | null }>();
    for (const r of stats) {
      statsMap.set(r.id, {
        c: Number(r.application_count) || 0,
        ap: r.applicants_avg != null ? Number(r.applicants_avg) : null,
        td: r.top_devs_avg != null ? Number(r.top_devs_avg) : null,
      });
    }

    const enriched = data.map((j) => {
      const s = statsMap.get(j.id);
      return Object.assign(j, {
        application_count: s?.c ?? 0,
        applicants_avg_score: s?.ap ?? null,
        top_devs_avg_score: s?.td ?? null,
      });
    });

    return { data: enriched, meta: { current_page: page, limit, total, last_page } };
  }

  async searchPublic(filters: {
    q?: string;
    work_mode?: string;
    contract_model?: string;
    seniority?: string;
    city_id?: number;
    skills?: { skill_id: string; min_level?: string }[];
    period?: 'last_month' | 'older_30' | 'older_60';
    view?: 'global' | 'for_you' | 'applied';
    dev_profile_id?: string;
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

    // Period filter (created_at)
    if (filters.period === 'last_month') {
      idsQb.andWhere(`job.created_at >= NOW() - INTERVAL '30 days'`);
    } else if (filters.period === 'older_30') {
      idsQb.andWhere(`job.created_at <  NOW() - INTERVAL '30 days'`);
    } else if (filters.period === 'older_60') {
      idsQb.andWhere(`job.created_at <  NOW() - INTERVAL '60 days'`);
    }

    // View filter — requires dev_profile_id when view is dev-specific
    if (filters.view === 'for_you' && filters.dev_profile_id) {
      idsQb.andWhere(`EXISTS (
        SELECT 1 FROM match_scores ms
        WHERE ms.job_id = job.id
          AND ms.dev_profile_id = :viewDevId
          AND ms.score >= 60
      )`, { viewDevId: filters.dev_profile_id });
    } else if (filters.view === 'applied' && filters.dev_profile_id) {
      idsQb.andWhere(`EXISTS (
        SELECT 1 FROM job_applications ja
        WHERE ja.job_id = job.id
          AND ja.dev_profile_id = :viewDevId
      )`, { viewDevId: filters.dev_profile_id });
    } else if ((filters.view === 'for_you' || filters.view === 'applied') && !filters.dev_profile_id) {
      // Dev-specific view without authenticated dev → empty result
      return { data: [], meta: { current_page: page, limit, total: 0, last_page: 1 } };
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

  async findOwned(jobId: string, companyProfileId: string): Promise<Job> {
    const job = await this.jobRepo.findOne({
      where: { id: jobId },
      relations: ['skills', 'skills.skill', 'city', 'city.state'],
    });
    if (!job) {
      throw new NotFoundException('Vaga não encontrada.');
    }
    if (job.companyProfileId !== companyProfileId) {
      throw new ForbiddenException('Sem permissão para acessar esta vaga.');
    }
    return job;
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
    this.validateSalaryRanges(dto);

    const job = this.jobRepo.create({
      companyProfileId,
      companyUnitId: dto.company_unit_id ?? null,
      title: dto.title,
      description: dto.description,
      seniority: dto.seniority,
      minExperienceYears: dto.min_experience_years,
      contractModel: dto.contract_model,
      salaryCltMin: dto.salary_clt_min ?? null,
      salaryCltMax: dto.salary_clt_max ?? null,
      salaryPjMin: dto.salary_pj_min ?? null,
      salaryPjMax: dto.salary_pj_max ?? null,
      showSalary: dto.show_salary ?? false,
      benefits: dto.benefits ?? null,
      workMode: dto.work_mode,
      maxRadiusKm: dto.max_radius_km ?? null,
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

    // Valida ranges considerando valores existentes para campos nao informados
    this.validateSalaryRanges({
      salary_clt_min: dto.salary_clt_min !== undefined ? dto.salary_clt_min : (job.salaryCltMin != null ? Number(job.salaryCltMin) : null),
      salary_clt_max: dto.salary_clt_max !== undefined ? dto.salary_clt_max : (job.salaryCltMax != null ? Number(job.salaryCltMax) : null),
      salary_pj_min:  dto.salary_pj_min  !== undefined ? dto.salary_pj_min  : (job.salaryPjMin  != null ? Number(job.salaryPjMin)  : null),
      salary_pj_max:  dto.salary_pj_max  !== undefined ? dto.salary_pj_max  : (job.salaryPjMax  != null ? Number(job.salaryPjMax)  : null),
    });

    const updateData: Partial<Job> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.seniority !== undefined) updateData.seniority = dto.seniority;
    if (dto.min_experience_years !== undefined) updateData.minExperienceYears = dto.min_experience_years;
    if (dto.contract_model !== undefined) updateData.contractModel = dto.contract_model;
    if (dto.salary_clt_min !== undefined) updateData.salaryCltMin = dto.salary_clt_min ?? null;
    if (dto.salary_clt_max !== undefined) updateData.salaryCltMax = dto.salary_clt_max ?? null;
    if (dto.salary_pj_min !== undefined) updateData.salaryPjMin = dto.salary_pj_min ?? null;
    if (dto.salary_pj_max !== undefined) updateData.salaryPjMax = dto.salary_pj_max ?? null;
    if (dto.max_radius_km !== undefined) updateData.maxRadiusKm = dto.max_radius_km ?? null;
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

  private validateSalaryRanges(dto: { salary_clt_min?: number | null; salary_clt_max?: number | null; salary_pj_min?: number | null; salary_pj_max?: number | null }): void {
    const cltMin = dto.salary_clt_min;
    const cltMax = dto.salary_clt_max;
    const pjMin = dto.salary_pj_min;
    const pjMax = dto.salary_pj_max;

    if (cltMin != null && cltMax != null && Number(cltMax) < Number(cltMin)) {
      throw new UnprocessableEntityException('Salário CLT máximo deve ser maior ou igual ao mínimo.');
    }
    if (pjMin != null && pjMax != null && Number(pjMax) < Number(pjMin)) {
      throw new UnprocessableEntityException('Salário PJ máximo deve ser maior ou igual ao mínimo.');
    }
    if ((cltMin != null) !== (cltMax != null)) {
      throw new UnprocessableEntityException('Informe ambos salários CLT (mínimo e máximo) ou nenhum.');
    }
    if ((pjMin != null) !== (pjMax != null)) {
      throw new UnprocessableEntityException('Informe ambos salários PJ (mínimo e máximo) ou nenhum.');
    }
  }
}
