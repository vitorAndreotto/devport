import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Education } from './education.entity.js';
import { CreateEducationDto } from './dto/create-education.dto.js';
import { UpdateEducationDto } from './dto/update-education.dto.js';
import { DevProfileService } from '../dev-profile/dev-profile.service.js';

@Injectable()
export class EducationService {
  constructor(
    @InjectRepository(Education)
    private readonly educationRepo: Repository<Education>,
    private readonly devProfileService: DevProfileService,
  ) {}

  async listByUser(userId: string): Promise<Education[]> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    return this.educationRepo.find({
      where: { devProfileId: profile.id },
      order: { isOngoing: 'DESC', startDate: { direction: 'DESC', nulls: 'LAST' } },
    });
  }

  async create(userId: string, dto: CreateEducationDto): Promise<Education> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    this.validateBusinessRules(dto.type, dto.workload_hours, dto.is_ongoing, dto.end_date, dto.start_date);

    const education = this.educationRepo.create({
      devProfileId: profile.id,
      institution: dto.institution,
      course: dto.course,
      type: dto.type,
      workloadHours: dto.workload_hours ?? null,
      startDate: dto.start_date ?? null,
      endDate: dto.end_date ?? null,
      isOngoing: dto.is_ongoing ?? false,
    });

    return this.educationRepo.save(education);
  }

  async update(userId: string, educationId: string, dto: UpdateEducationDto): Promise<Education> {
    const education = await this.findOwnedOrFail(userId, educationId);

    const type = dto.type !== undefined ? dto.type : education.type;
    const workloadHours = dto.workload_hours !== undefined ? dto.workload_hours : education.workloadHours;
    const isOngoing = dto.is_ongoing !== undefined ? dto.is_ongoing : education.isOngoing;
    const endDate = dto.end_date !== undefined ? dto.end_date : education.endDate;
    const startDate = dto.start_date !== undefined ? dto.start_date : education.startDate;

    this.validateBusinessRules(type, workloadHours, isOngoing, endDate, startDate);

    const updateData: Partial<Education> = {};
    if (dto.institution !== undefined) updateData.institution = dto.institution;
    if (dto.course !== undefined) updateData.course = dto.course;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.workload_hours !== undefined) updateData.workloadHours = dto.workload_hours ?? null;
    if (dto.start_date !== undefined) updateData.startDate = dto.start_date ?? null;
    if (dto.end_date !== undefined) updateData.endDate = dto.end_date ?? null;
    if (dto.is_ongoing !== undefined) updateData.isOngoing = dto.is_ongoing;

    await this.educationRepo.update(educationId, updateData);

    return this.educationRepo.findOneOrFail({ where: { id: educationId } });
  }

  async remove(userId: string, educationId: string): Promise<void> {
    const education = await this.findOwnedOrFail(userId, educationId);
    await this.educationRepo.remove(education);
  }

  private async findOwnedOrFail(userId: string, educationId: string): Promise<Education> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    const education = await this.educationRepo.findOne({
      where: { id: educationId },
    });

    if (!education) {
      throw new NotFoundException('Formação não encontrada.');
    }

    if (education.devProfileId !== profile.id) {
      throw new ForbiddenException('Sem permissão.');
    }

    return education;
  }

  private validateBusinessRules(
    type?: string,
    workloadHours?: number | null,
    isOngoing?: boolean,
    endDate?: string | null,
    startDate?: string | null,
  ): void {
    if (isOngoing && endDate) {
      throw new BadRequestException('Formação em andamento não pode ter data de término.');
    }

    if (type === 'course' && (workloadHours === null || workloadHours === undefined)) {
      throw new BadRequestException('Cursos devem informar a carga horária.');
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException('Data de término deve ser posterior à data de início.');
    }
  }
}
