import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CompanyUnitService } from './company-unit.service.js';
import { CompanyProfileService } from '../company-profile/company-profile.service.js';
import { CreateCompanyUnitDto } from './dto/create-company-unit.dto.js';
import { UpdateCompanyUnitDto } from './dto/update-company-unit.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { CompanyUnit } from './company-unit.entity.js';

@Controller('company/units')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Company)
export class CompanyUnitController {
  constructor(
    private readonly unitService: CompanyUnitService,
    private readonly profileService: CompanyProfileService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const units = await this.unitService.findByCompanyProfileId(profile.id);
    return units.map((u) => this.toResponse(u));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateCompanyUnitDto,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const unit = await this.unitService.create(profile.id, dto);
    return this.toResponse(unit);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) unitId: string,
    @Body() dto: UpdateCompanyUnitDto,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    const unit = await this.unitService.update(profile.id, unitId, dto);
    return this.toResponse(unit);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) unitId: string,
  ) {
    const profile = await this.profileService.findByUserIdOrFail(user.id);
    await this.unitService.remove(profile.id, unitId);
  }

  private toResponse(unit: CompanyUnit) {
    return {
      id: unit.id,
      name: unit.name,
      city_id: unit.cityId,
      zip_code: unit.zipCode,
      street: unit.street,
      neighborhood: unit.neighborhood,
      number: unit.number,
      complement: unit.complement,
      created_at: unit.createdAt,
      updated_at: unit.updatedAt,
    };
  }
}
