import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobService } from './job.service.js';
import { CompanyProfileService } from '../company-profile/company-profile.service.js';
import { MatchingService } from '../matching/matching.service.js';
import { CreateJobDto } from './dto/create-job.dto.js';
import { UpdateJobDto } from './dto/update-job.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { OptionalAuthGuard } from '../common/guards/optional-auth.guard.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { Experience } from '../experience/experience.entity.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { Job } from './job.entity.js';

@Controller('company/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Company)
export class CompanyJobController {
  constructor(
    private readonly jobService: JobService,
    private readonly profileService: CompanyProfileService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const jobs = await this.jobService.findByCompanyProfileId(profile.id);
    return jobs.map((j) => this.toOwnerResponse(j));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateJobDto,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const job = await this.jobService.create(profile.id, dto);
    return this.toOwnerResponse(job);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body() dto: UpdateJobDto,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const job = await this.jobService.update(profile.id, jobId, dto);
    return this.toOwnerResponse(job);
  }

  @Patch(':id/close')
  async close(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) jobId: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const job = await this.jobService.close(profile.id, jobId);
    return { id: job.id, status: job.status, updated_at: job.updatedAt };
  }

  @Patch(':id/reopen')
  async reopen(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) jobId: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const job = await this.jobService.reopen(profile.id, jobId);
    return { id: job.id, status: job.status, updated_at: job.updatedAt };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) jobId: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    await this.jobService.remove(profile.id, jobId);
  }

  private toOwnerResponse(job: Job) {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      seniority: job.seniority,
      skills: this.formatSkills(job),
      min_experience_years: job.minExperienceYears,
      contract_model: job.contractModel,
      salary_min: job.salaryMin,
      salary_max: job.salaryMax,
      show_salary: job.showSalary,
      benefits: job.benefits,
      work_mode: job.workMode,
      company_unit_id: job.companyUnitId,
      city_id: job.cityId,
      zip_code: job.zipCode,
      street: job.street,
      neighborhood: job.neighborhood,
      number: job.number,
      complement: job.complement,
      status: job.status,
      created_at: job.createdAt,
      updated_at: job.updatedAt,
    };
  }

  private formatSkills(job: Job) {
    return (job.skills ?? []).map((js) => ({
      skill: js.skill ? {
        id: js.skill.id,
        name: js.skill.name,
        slug: js.skill.slug,
        category: js.skill.category,
      } : { id: js.skillId },
      min_level: js.minLevel,
      requirement: js.requirement,
    }));
  }
}

@Controller('jobs')
export class PublicJobController {
  constructor(
    private readonly jobService: JobService,
    private readonly matchingService: MatchingService,
    @InjectRepository(DevProfile)
    private readonly devProfileRepo: Repository<DevProfile>,
    @InjectRepository(DevSkill)
    private readonly devSkillRepo: Repository<DevSkill>,
    @InjectRepository(Experience)
    private readonly experienceRepo: Repository<Experience>,
  ) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async search(
    @CurrentUser() user: User | null,
    @Query('q') q?: string,
    @Query('work_mode') workMode?: string,
    @Query('contract_model') contractModel?: string,
    @Query('seniority') seniority?: string,
    @Query('city_id') cityId?: string,
    @Query('skills') skillsRaw?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    let skills: { skill_id: string; min_level?: string }[] | undefined;
    if (skillsRaw) {
      skills = skillsRaw.split(',').map((entry) => {
        const [skillId, minLevel] = entry.split(':');
        return { skill_id: skillId, min_level: minLevel || undefined };
      });
    }

    const result = await this.jobService.searchPublic({
      q,
      work_mode: workMode,
      contract_model: contractModel,
      seniority,
      city_id: cityId ? parseInt(cityId, 10) : undefined,
      skills,
      page: pageRaw ? parseInt(pageRaw, 10) : undefined,
      limit: limitRaw ? parseInt(limitRaw, 10) : undefined,
    });

    // Compute match scores if dev is logged in
    let matchScores: Map<string, number> | null = null;
    if (user?.role === 'dev') {
      const devData = await this.buildDevData(user.id);
      if (devData) {
        const jobDatas = result.data.map((j) => this.buildJobData(j));
        const scores = await this.matchingService.getScoresBatch(devData, jobDatas);
        matchScores = new Map();
        for (const [jobId, mr] of scores) {
          matchScores.set(jobId, mr.score);
        }
      }
    }

    return {
      data: result.data.map((j) => ({
        ...this.toListItem(j),
        ...(matchScores ? { match_score: matchScores.get(j.id) ?? null } : {}),
      })),
      meta: result.meta,
    };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findOne(
    @CurrentUser() user: User | null,
    @Param('id', ParseUUIDPipe) jobId: string,
  ) {
    const job = await this.jobService.findPublicById(jobId);
    const applicationCount = await this.jobService.countApplications(jobId);
    const detail = this.toDetail(job, applicationCount);

    if (user?.role === 'dev') {
      const devData = await this.buildDevData(user.id);
      if (devData) {
        const jobData = this.buildJobData(job);
        const match = await this.matchingService.getScore(devData, jobData);
        return {
          ...detail,
          match_score: match.score,
          match_detail: {
            skills: match.skillScore,
            experience: match.experienceScore,
            modality: match.modalityScore,
            salary: match.salaryScore,
          },
        };
      }
    }

    return detail;
  }

  /** Response leve para listagem — sem description, address, benefits */
  private toListItem(job: Job) {
    const requiredSkills = (job.skills ?? [])
      .filter((js) => js.requirement === 'required')
      .map((js) => js.skill?.name ?? '')
      .filter(Boolean)
      .slice(0, 4);

    return {
      id: job.id,
      title: job.title,
      seniority: job.seniority,
      contract_model: job.contractModel,
      work_mode: job.workMode,
      required_skills: requiredSkills,
      city_name: job.city?.name ?? null,
      state_abbr: job.city?.state?.abbr ?? null,
      status: job.status,
      company: job.companyProfile ? {
        id: job.companyProfile.id,
        company_name: job.companyProfile.companyName,
        logo_url: job.companyProfile.logoUrl,
      } : undefined,
      created_at: job.createdAt,
    };
  }

  /** Response completa para detalhe */
  private toDetail(job: Job, applicationCount: number) {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      seniority: job.seniority,
      skills: (job.skills ?? []).map((js) => ({
        skill: js.skill ? {
          id: js.skill.id,
          name: js.skill.name,
          slug: js.skill.slug,
          category: js.skill.category,
        } : { id: js.skillId },
        min_level: js.minLevel,
        requirement: js.requirement,
      })),
      min_experience_years: job.minExperienceYears,
      contract_model: job.contractModel,
      ...(job.showSalary ? { salary_min: job.salaryMin, salary_max: job.salaryMax } : {}),
      benefits: job.benefits,
      work_mode: job.workMode,
      location: job.city ? {
        city: job.city.name,
        state: job.city.state?.abbr ?? null,
        zip_code: job.zipCode,
        street: job.street,
        neighborhood: job.neighborhood,
        number: job.number,
        complement: job.complement,
      } : null,
      status: job.status,
      company: job.companyProfile ? {
        id: job.companyProfile.id,
        company_name: job.companyProfile.companyName,
        logo_url: job.companyProfile.logoUrl,
      } : undefined,
      application_count: applicationCount,
      created_at: job.createdAt,
    };
  }

  private async buildDevData(userId: string) {
    const profile = await this.devProfileRepo.findOne({ where: { userId } });
    if (!profile) return null;

    const skills = await this.devSkillRepo.find({ where: { devProfileId: profile.id } });
    const experiences = await this.experienceRepo.find({ where: { devProfileId: profile.id } });

    let totalMonths = 0;
    const now = new Date();
    for (const exp of experiences) {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? now : (exp.endDate ? new Date(exp.endDate) : now);
      totalMonths += Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
    }

    return {
      id: profile.id,
      workModes: profile.workModes,
      cityId: profile.cityId,
      salaryMin: profile.salaryMin,
      salaryMax: profile.salaryMax,
      skills: skills.map((s) => ({ skillId: s.skillId, level: s.level })),
      totalExperienceMonths: totalMonths,
    };
  }

  private buildJobData(job: Job) {
    return {
      id: job.id,
      workMode: job.workMode,
      cityId: job.cityId,
      cityStateId: null as number | null,
      salaryMin: Number(job.salaryMin),
      salaryMax: Number(job.salaryMax),
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
