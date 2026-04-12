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
import { EducationService } from './education.service.js';
import { CreateEducationDto } from './dto/create-education.dto.js';
import { UpdateEducationDto } from './dto/update-education.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { Education } from './education.entity.js';

@Controller('dev/educations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class EducationController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    const educations = await this.educationService.listByUser(user.id);
    return educations.map((e) => this.toResponse(e));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateEducationDto,
  ) {
    const education = await this.educationService.create(user.id, dto);
    return this.toResponse(education);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEducationDto,
  ) {
    const education = await this.educationService.update(user.id, id, dto);
    return this.toResponse(education);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.educationService.remove(user.id, id);
  }

  private toResponse(edu: Education) {
    return {
      id: edu.id,
      institution: edu.institution,
      course: edu.course,
      type: edu.type,
      workload_hours: edu.workloadHours,
      start_date: edu.startDate,
      end_date: edu.endDate,
      is_ongoing: edu.isOngoing,
      created_at: edu.createdAt,
      updated_at: edu.updatedAt,
    };
  }
}
