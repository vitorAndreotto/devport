import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { DevProfileService } from '../dev-profile/dev-profile.service.js';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly devProfileService: DevProfileService,
  ) {}

  async listByUser(userId: string): Promise<Project[]> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    return this.projectRepo.find({
      where: { devProfileId: profile.id },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    const project = this.projectRepo.create({
      devProfileId: profile.id,
      name: dto.name,
      description: dto.description,
      technologies: dto.technologies ?? null,
      repositoryUrl: dto.repository_url ?? null,
      demoUrl: dto.demo_url ?? null,
      imageUrl: dto.image_url ?? null,
      source: 'manual',
    });

    return this.projectRepo.save(project);
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findOwnedOrFail(userId, projectId);

    const updateData: Partial<Project> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.technologies !== undefined) updateData.technologies = dto.technologies ?? null;
    if (dto.repository_url !== undefined) updateData.repositoryUrl = dto.repository_url ?? null;
    if (dto.demo_url !== undefined) updateData.demoUrl = dto.demo_url ?? null;
    if (dto.image_url !== undefined) updateData.imageUrl = dto.image_url ?? null;

    await this.projectRepo.update(projectId, updateData);

    return this.projectRepo.findOneOrFail({ where: { id: projectId } });
  }

  async remove(userId: string, projectId: string): Promise<void> {
    const project = await this.findOwnedOrFail(userId, projectId);
    await this.projectRepo.remove(project);
  }

  private async findOwnedOrFail(userId: string, projectId: string): Promise<Project> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    const project = await this.projectRepo.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    if (project.devProfileId !== profile.id) {
      throw new ForbiddenException('Sem permissão.');
    }

    return project;
  }
}
