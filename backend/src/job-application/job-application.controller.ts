import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobApplicationService } from './job-application.service.js';
import { DevProfileService } from '../dev-profile/dev-profile.service.js';
import { CompanyProfileService } from '../company-profile/company-profile.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { JobApplication } from './job-application.entity.js';

// --- Dev endpoints ---

@Controller('dev/applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class DevApplicationController {
  constructor(
    private readonly appService: JobApplicationService,
    private readonly profileService: DevProfileService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async apply(
    @CurrentUser() user: User,
    @Body() dto: CreateApplicationDto,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const app = await this.appService.apply(profile.id, dto.job_id);
    return this.toResponse(app);
  }

  @Get()
  async findMine(
    @CurrentUser() user: User,
    @Query('status') status?: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    let apps = await this.appService.findByDevProfile(profile.id);
    if (status) {
      apps = apps.filter((a) => a.status === status);
    }
    return apps.map((a) => this.toResponseWithJob(a));
  }

  @Patch(':id/withdraw')
  async withdraw(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) appId: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const app = await this.appService.withdraw(profile.id, appId);
    return { id: app.id, status: app.status, updated_at: app.updatedAt };
  }

  private toResponse(app: JobApplication) {
    return {
      id: app.id,
      job_id: app.jobId,
      status: app.status,
      created_at: app.createdAt,
    };
  }

  private toResponseWithJob(app: JobApplication) {
    return {
      id: app.id,
      status: app.status,
      job: app.job ? {
        id: app.job.id,
        title: app.job.title,
        seniority: app.job.seniority,
        work_mode: app.job.workMode,
        contract_model: app.job.contractModel,
        city_id: app.job.cityId,
        status: app.job.status,
        company: app.job.companyProfile ? {
          company_name: app.job.companyProfile.companyName,
          logo_url: app.job.companyProfile.logoUrl,
        } : undefined,
      } : undefined,
      created_at: app.createdAt,
      updated_at: app.updatedAt,
    };
  }
}

// --- Company endpoints ---

@Controller('company/jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Company)
export class CompanyApplicationController {
  constructor(
    private readonly appService: JobApplicationService,
    private readonly profileService: CompanyProfileService,
  ) {}

  @Get(':jobId/applications')
  async findByJob(
    @CurrentUser() user: User,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    await this.profileService.findByUserIdOrFail(user.id);
    const apps = await this.appService.findByJob(jobId);
    return apps.map((a) => ({
      id: a.id,
      status: a.status,
      dev: a.devProfile ? {
        id: a.devProfile.id,
        full_name: a.devProfile.fullName,
        title: a.devProfile.title,
        avatar_url: a.devProfile.avatarUrl,
        employment_status: a.devProfile.employmentStatus,
      } : undefined,
      created_at: a.createdAt,
    }));
  }

  @Patch(':jobId/applications/:appId/accept')
  async accept(
    @CurrentUser() user: User,
    @Param('jobId', ParseUUIDPipe) _jobId: string,
    @Param('appId', ParseUUIDPipe) appId: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const app = await this.appService.accept(profile.id, appId);
    return { id: app.id, status: app.status, updated_at: app.updatedAt };
  }

  @Patch(':jobId/applications/:appId/reject')
  async reject(
    @CurrentUser() user: User,
    @Param('jobId', ParseUUIDPipe) _jobId: string,
    @Param('appId', ParseUUIDPipe) appId: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const app = await this.appService.reject(profile.id, appId);
    return { id: app.id, status: app.status, updated_at: app.updatedAt };
  }
}
