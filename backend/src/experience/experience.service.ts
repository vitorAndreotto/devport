import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from './experience.entity.js';
import { CreateExperienceDto } from './dto/create-experience.dto.js';
import { UpdateExperienceDto } from './dto/update-experience.dto.js';
import { DevProfileService } from '../dev-profile/dev-profile.service.js';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepo: Repository<Experience>,
    private readonly devProfileService: DevProfileService,
  ) {}

  async listByUser(userId: string): Promise<Experience[]> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    return this.experienceRepo.find({
      where: { devProfileId: profile.id },
      order: { isCurrent: 'DESC', startDate: 'DESC' },
    });
  }

  async create(userId: string, dto: CreateExperienceDto): Promise<Experience> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    this.validateCurrentAndEndDate(dto.is_current, dto.end_date);
    this.validateDateRange(dto.start_date, dto.end_date);

    const experience = this.experienceRepo.create({
      devProfileId: profile.id,
      company: dto.company,
      position: dto.position,
      description: dto.description ?? null,
      startDate: dto.start_date,
      endDate: dto.end_date ?? null,
      isCurrent: dto.is_current ?? false,
    });

    return this.experienceRepo.save(experience);
  }

  async update(userId: string, experienceId: string, dto: UpdateExperienceDto): Promise<Experience> {
    const experience = await this.findOwnedOrFail(userId, experienceId);

    const isCurrent = dto.is_current !== undefined ? dto.is_current : experience.isCurrent;
    const endDate = dto.end_date !== undefined ? dto.end_date : experience.endDate;
    const startDate = dto.start_date !== undefined ? dto.start_date : experience.startDate;

    this.validateCurrentAndEndDate(isCurrent, endDate);
    this.validateDateRange(startDate, endDate);

    const updateData: Partial<Experience> = {};
    if (dto.company !== undefined) updateData.company = dto.company;
    if (dto.position !== undefined) updateData.position = dto.position;
    if (dto.description !== undefined) updateData.description = dto.description ?? null;
    if (dto.start_date !== undefined) updateData.startDate = dto.start_date;
    if (dto.end_date !== undefined) updateData.endDate = dto.end_date ?? null;
    if (dto.is_current !== undefined) updateData.isCurrent = dto.is_current;

    await this.experienceRepo.update(experienceId, updateData);

    return this.experienceRepo.findOneOrFail({ where: { id: experienceId } });
  }

  async remove(userId: string, experienceId: string): Promise<void> {
    const experience = await this.findOwnedOrFail(userId, experienceId);
    await this.experienceRepo.remove(experience);
  }

  private async findOwnedOrFail(userId: string, experienceId: string): Promise<Experience> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    const experience = await this.experienceRepo.findOne({
      where: { id: experienceId },
    });

    if (!experience) {
      throw new NotFoundException('Experiência não encontrada.');
    }

    if (experience.devProfileId !== profile.id) {
      throw new ForbiddenException('Sem permissão.');
    }

    return experience;
  }

  private validateCurrentAndEndDate(isCurrent?: boolean, endDate?: string | null): void {
    if (isCurrent && endDate) {
      throw new BadRequestException('Experiência atual não pode ter data de término.');
    }
  }

  private validateDateRange(startDate?: string, endDate?: string | null): void {
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('Data de término deve ser posterior à data de início.');
    }
  }
}
