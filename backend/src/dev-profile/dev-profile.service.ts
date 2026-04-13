import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevProfile } from './dev-profile.entity.js';
import { CreateDevProfileDto } from './dto/create-dev-profile.dto.js';
import { UpdateDevProfileDto } from './dto/update-dev-profile.dto.js';

@Injectable()
export class DevProfileService {
  constructor(
    @InjectRepository(DevProfile)
    private readonly profileRepo: Repository<DevProfile>,
  ) {}

  async findByUserId(userId: string): Promise<DevProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async findByUserIdOrFail(userId: string): Promise<DevProfile> {
    const profile = await this.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }
    return profile;
  }

  async findByHandle(handle: string): Promise<DevProfile | null> {
    return this.profileRepo.findOne({ where: { handle } });
  }

  async create(userId: string, dto: CreateDevProfileDto): Promise<DevProfile> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Perfil já existe.');
    }

    const handleTaken = await this.findByHandle(dto.handle);
    if (handleTaken) {
      throw new ConflictException('Handle já está em uso.');
    }

    const profile = this.profileRepo.create({
      userId,
      handle: dto.handle,
      fullName: dto.full_name,
      title: dto.title,
      bio: dto.bio,
      avatarUrl: dto.avatar_url ?? null,
      emailContact: dto.email_contact,
      cityId: dto.city_id ?? null,
      zipCode: dto.zip_code ?? null,
      street: dto.street ?? null,
      neighborhood: dto.neighborhood ?? null,
      number: dto.number ?? null,
      complement: dto.complement ?? null,
      workModes: dto.work_modes ?? null,
      employmentStatus: dto.employment_status ?? null,
      salaryMin: dto.salary_min ?? null,
      salaryMax: dto.salary_max ?? null,
      githubUsername: dto.github_username ?? null,
      links: dto.links ?? null,
    });

    return this.profileRepo.save(profile);
  }

  async update(userId: string, dto: UpdateDevProfileDto): Promise<DevProfile> {
    const profile = await this.findByUserIdOrFail(userId);

    if (dto.handle !== undefined && dto.handle !== profile.handle) {
      const handleTaken = await this.findByHandle(dto.handle);
      if (handleTaken) {
        throw new ConflictException('Handle já está em uso.');
      }
    }

    const updateData: Partial<DevProfile> = {};
    if (dto.handle !== undefined) updateData.handle = dto.handle;
    if (dto.full_name !== undefined) updateData.fullName = dto.full_name;
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.bio !== undefined) updateData.bio = dto.bio;
    if (dto.avatar_url !== undefined) updateData.avatarUrl = dto.avatar_url ?? null;
    if (dto.email_contact !== undefined) updateData.emailContact = dto.email_contact;
    if (dto.city_id !== undefined) updateData.cityId = dto.city_id ?? null;
    if (dto.zip_code !== undefined) updateData.zipCode = dto.zip_code ?? null;
    if (dto.street !== undefined) updateData.street = dto.street ?? null;
    if (dto.neighborhood !== undefined) updateData.neighborhood = dto.neighborhood ?? null;
    if (dto.number !== undefined) updateData.number = dto.number ?? null;
    if (dto.complement !== undefined) updateData.complement = dto.complement ?? null;
    if (dto.work_modes !== undefined) updateData.workModes = dto.work_modes ?? null;
    if (dto.employment_status !== undefined) updateData.employmentStatus = dto.employment_status ?? null;
    if (dto.salary_min !== undefined) updateData.salaryMin = dto.salary_min ?? null;
    if (dto.salary_max !== undefined) updateData.salaryMax = dto.salary_max ?? null;
    if (dto.github_username !== undefined) updateData.githubUsername = dto.github_username ?? null;
    if (dto.links !== undefined) updateData.links = dto.links ?? null;

    await this.profileRepo.update(profile.id, updateData);

    return this.findByUserIdOrFail(userId);
  }

  async findPublicByHandle(handle: string): Promise<DevProfile> {
    const profile = await this.findByHandle(handle);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }
    return profile;
  }
}
