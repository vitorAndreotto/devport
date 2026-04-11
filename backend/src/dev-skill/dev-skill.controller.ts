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
import { DevSkillService } from './dev-skill.service.js';
import { CreateDevSkillDto } from './dto/create-dev-skill.dto.js';
import { UpdateDevSkillDto } from './dto/update-dev-skill.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { DevSkill } from './dev-skill.entity.js';

@Controller('dev/skills')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class DevSkillController {
  constructor(private readonly devSkillService: DevSkillService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    const skills = await this.devSkillService.listByUser(user.id);
    return skills.map((s) => this.toResponse(s));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateDevSkillDto,
  ) {
    const skill = await this.devSkillService.create(user.id, dto);
    return this.toResponse(skill);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDevSkillDto,
  ) {
    const skill = await this.devSkillService.update(user.id, id, dto);
    return this.toResponse(skill);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.devSkillService.remove(user.id, id);
  }

  private toResponse(devSkill: DevSkill) {
    return {
      id: devSkill.id,
      skill: {
        id: devSkill.skill.id,
        name: devSkill.skill.name,
        slug: devSkill.skill.slug,
        category: devSkill.skill.category,
      },
      level: devSkill.level,
      years_experience: devSkill.yearsExperience,
      created_at: devSkill.createdAt,
      updated_at: devSkill.updatedAt,
    };
  }
}
