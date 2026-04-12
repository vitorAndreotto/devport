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
import { ProjectService } from './project.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { User } from '../users/user.entity.js';
import { Project } from './project.entity.js';

@Controller('dev/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Dev)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async list(@CurrentUser() user: User) {
    const projects = await this.projectService.listByUser(user.id);
    return projects.map((p) => this.toResponse(p));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateProjectDto,
  ) {
    const project = await this.projectService.create(user.id, dto);
    return this.toResponse(project);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const project = await this.projectService.update(user.id, id, dto);
    return this.toResponse(project);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.projectService.remove(user.id, id);
  }

  private toResponse(project: Project) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      technologies: project.technologies,
      repository_url: project.repositoryUrl,
      demo_url: project.demoUrl,
      image_url: project.imageUrl,
      source: project.source,
      github_repo_id: project.githubRepoId,
      github_stars: project.githubStars,
      github_language: project.githubLanguage,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    };
  }
}
