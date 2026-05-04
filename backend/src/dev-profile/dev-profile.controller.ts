import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { DevProfileService } from './dev-profile.service.js';
import { CreateDevProfileDto } from './dto/create-dev-profile.dto.js';
import { UpdateDevProfileDto } from './dto/update-dev-profile.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ParseHandlePipe } from '../common/pipes/parse-handle.pipe.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { DevProfile } from './dev-profile.entity.js';

@Controller('dev/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class DevProfileController {
  constructor(private readonly devProfileService: DevProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateDevProfileDto,
  ) {
    const profile = await this.devProfileService.create(user.id, dto);
    return this.toResponse(profile);
  }

  @Get()
  async findOwn(@CurrentUser() user: User) {
    const profile = await this.devProfileService.findByUserIdOrFail(user.id);
    return this.toResponse(profile);
  }

  @Put()
  async update(
    @CurrentUser() user: User,
    @Body() dto: UpdateDevProfileDto,
  ) {
    const profile = await this.devProfileService.update(user.id, dto);
    return this.toResponse(profile);
  }

  private toResponse(profile: DevProfile) {
    return {
      id: profile.id,
      user_id: profile.userId,
      handle: profile.handle,
      full_name: profile.fullName,
      title: profile.title,
      bio: profile.bio,
      avatar_url: profile.avatarUrl,
      email_contact: profile.emailContact,
      city_id: profile.cityId,
      zip_code: profile.zipCode,
      street: profile.street,
      neighborhood: profile.neighborhood,
      number: profile.number,
      complement: profile.complement,
      work_modes: profile.workModes,
      employment_status: profile.employmentStatus,
      max_radius_km: profile.maxRadiusKm,
      salary_clt_min: profile.salaryCltMin,
      salary_clt_max: profile.salaryCltMax,
      salary_pj_min: profile.salaryPjMin,
      salary_pj_max: profile.salaryPjMax,
      github_username: profile.githubUsername,
      links: profile.links,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    };
  }
}

@Controller('developers')
export class DeveloperProfileController {
  constructor(private readonly devProfileService: DevProfileService) {}

  @Get('check-handle/:handle')
  async checkHandle(@Param('handle', ParseHandlePipe) handle: string) {
    const profile = await this.devProfileService.findByHandle(handle);
    return { available: !profile };
  }

  @Get(':handle')
  async findPublic(@Param('handle', ParseHandlePipe) handle: string) {
    const profile = await this.devProfileService.findPublicByHandle(handle);
    return {
      id: profile.id,
      handle: profile.handle,
      full_name: profile.fullName,
      title: profile.title,
      bio: profile.bio,
      avatar_url: profile.avatarUrl,
      email_contact: profile.emailContact,
      city_id: profile.cityId,
      zip_code: profile.zipCode,
      street: profile.street,
      neighborhood: profile.neighborhood,
      number: profile.number,
      complement: profile.complement,
      work_modes: profile.workModes,
      employment_status: profile.employmentStatus,
      github_username: profile.githubUsername,
      links: profile.links,
      created_at: profile.createdAt,
    };
  }
}
