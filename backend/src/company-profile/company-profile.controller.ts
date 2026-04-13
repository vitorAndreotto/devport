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
import { CompanyProfileService } from './company-profile.service.js';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto.js';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ParseHandlePipe } from '../common/pipes/parse-handle.pipe.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { CompanyProfile } from './company-profile.entity.js';

@Controller('company/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Company)
export class CompanyProfileController {
  constructor(private readonly companyProfileService: CompanyProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateCompanyProfileDto,
  ) {
    const profile = await this.companyProfileService.create(user.id, dto);
    return this.toResponse(profile);
  }

  @Get()
  async findOwn(@CurrentUser() user: User) {
    const profile = await this.companyProfileService.findByUserIdOrFail(user.id);
    return this.toResponse(profile);
  }

  @Put()
  async update(
    @CurrentUser() user: User,
    @Body() dto: UpdateCompanyProfileDto,
  ) {
    const profile = await this.companyProfileService.update(user.id, dto);
    return this.toResponse(profile);
  }

  private toResponse(profile: CompanyProfile) {
    return {
      id: profile.id,
      user_id: profile.userId,
      handle: profile.handle,
      company_name: profile.companyName,
      cnpj: profile.cnpj,
      description: profile.description,
      logo_url: profile.logoUrl,
      website: profile.website,
      industry: profile.industry,
      size: profile.size,
      city_id: profile.cityId,
      zip_code: profile.zipCode,
      street: profile.street,
      neighborhood: profile.neighborhood,
      number: profile.number,
      complement: profile.complement,
      links: profile.links,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    };
  }
}

@Controller('companies')
export class CompanyPublicController {
  constructor(private readonly companyProfileService: CompanyProfileService) {}

  @Get('check-handle/:handle')
  async checkHandle(@Param('handle', ParseHandlePipe) handle: string) {
    const profile = await this.companyProfileService.findByHandle(handle);
    return { available: !profile };
  }

  @Get(':handle')
  async findPublic(@Param('handle', ParseHandlePipe) handle: string) {
    const profile = await this.companyProfileService.findPublicByHandle(handle);
    return {
      id: profile.id,
      handle: profile.handle,
      company_name: profile.companyName,
      cnpj: profile.cnpj,
      description: profile.description,
      logo_url: profile.logoUrl,
      website: profile.website,
      industry: profile.industry,
      size: profile.size,
      city_id: profile.cityId,
      zip_code: profile.zipCode,
      street: profile.street,
      neighborhood: profile.neighborhood,
      number: profile.number,
      complement: profile.complement,
      links: profile.links,
      created_at: profile.createdAt,
    };
  }
}
