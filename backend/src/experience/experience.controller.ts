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
import { ExperienceService } from './experience.service.js';
import { CreateExperienceDto } from './dto/create-experience.dto.js';
import { UpdateExperienceDto } from './dto/update-experience.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { Experience } from './experience.entity.js';

@Controller('dev/experiences')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class ExperienceController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    const experiences = await this.experienceService.listByUser(user.id);
    return experiences.map((e) => this.toResponse(e));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateExperienceDto,
  ) {
    const experience = await this.experienceService.create(user.id, dto);
    return this.toResponse(experience);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExperienceDto,
  ) {
    const experience = await this.experienceService.update(user.id, id, dto);
    return this.toResponse(experience);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.experienceService.remove(user.id, id);
  }

  private toResponse(exp: Experience) {
    return {
      id: exp.id,
      company: exp.company,
      position: exp.position,
      description: exp.description,
      start_date: exp.startDate,
      end_date: exp.endDate,
      is_current: exp.isCurrent,
      skills: (exp.experienceSkills ?? []).map((es) => ({
        id: es.skill.id,
        name: es.skill.name,
        slug: es.skill.slug,
        category: es.skill.category,
      })),
      created_at: exp.createdAt,
      updated_at: exp.updatedAt,
    };
  }
}
