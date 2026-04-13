import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyProfile } from './company-profile.entity.js';
import { CreateCompanyProfileDto } from './dto/create-company-profile.dto.js';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto.js';

@Injectable()
export class CompanyProfileService {
  constructor(
    @InjectRepository(CompanyProfile)
    private readonly profileRepo: Repository<CompanyProfile>,
  ) {}

  async findByUserId(userId: string): Promise<CompanyProfile | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async findByUserIdOrFail(userId: string): Promise<CompanyProfile> {
    const profile = await this.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }
    return profile;
  }

  async findByHandle(handle: string): Promise<CompanyProfile | null> {
    return this.profileRepo.findOne({ where: { handle } });
  }

  async findByCnpj(cnpj: string): Promise<CompanyProfile | null> {
    return this.profileRepo.findOne({ where: { cnpj } });
  }

  async create(userId: string, dto: CreateCompanyProfileDto): Promise<CompanyProfile> {
    const existing = await this.findByUserId(userId);
    if (existing) {
      throw new ConflictException('Perfil já existe.');
    }

    const handleTaken = await this.findByHandle(dto.handle);
    if (handleTaken) {
      throw new ConflictException('Handle já está em uso.');
    }

    const cnpjTaken = await this.findByCnpj(dto.cnpj);
    if (cnpjTaken) {
      throw new ConflictException('CNPJ já está em uso.');
    }

    const profile = this.profileRepo.create({
      userId,
      handle: dto.handle,
      companyName: dto.company_name,
      cnpj: dto.cnpj,
      description: dto.description,
      logoUrl: dto.logo_url ?? null,
      website: dto.website ?? null,
      industry: dto.industry,
      size: dto.size,
      cityId: dto.city_id ?? null,
      zipCode: dto.zip_code ?? null,
      street: dto.street ?? null,
      neighborhood: dto.neighborhood ?? null,
      number: dto.number ?? null,
      complement: dto.complement ?? null,
      links: dto.links ?? null,
    });

    return this.profileRepo.save(profile);
  }

  async update(userId: string, dto: UpdateCompanyProfileDto): Promise<CompanyProfile> {
    const profile = await this.findByUserIdOrFail(userId);

    if (dto.handle !== undefined && dto.handle !== profile.handle) {
      const handleTaken = await this.findByHandle(dto.handle);
      if (handleTaken) {
        throw new ConflictException('Handle já está em uso.');
      }
    }

    if (dto.cnpj !== undefined && dto.cnpj !== profile.cnpj) {
      const cnpjTaken = await this.findByCnpj(dto.cnpj);
      if (cnpjTaken) {
        throw new ConflictException('CNPJ já está em uso.');
      }
    }

    const updateData: Partial<CompanyProfile> = {};
    if (dto.handle !== undefined) updateData.handle = dto.handle;
    if (dto.company_name !== undefined) updateData.companyName = dto.company_name;
    if (dto.cnpj !== undefined) updateData.cnpj = dto.cnpj;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.logo_url !== undefined) updateData.logoUrl = dto.logo_url ?? null;
    if (dto.website !== undefined) updateData.website = dto.website ?? null;
    if (dto.industry !== undefined) updateData.industry = dto.industry;
    if (dto.size !== undefined) updateData.size = dto.size;
    if (dto.city_id !== undefined) updateData.cityId = dto.city_id ?? null;
    if (dto.zip_code !== undefined) updateData.zipCode = dto.zip_code ?? null;
    if (dto.street !== undefined) updateData.street = dto.street ?? null;
    if (dto.neighborhood !== undefined) updateData.neighborhood = dto.neighborhood ?? null;
    if (dto.number !== undefined) updateData.number = dto.number ?? null;
    if (dto.complement !== undefined) updateData.complement = dto.complement ?? null;
    if (dto.links !== undefined) updateData.links = dto.links ?? null;

    await this.profileRepo.update(profile.id, updateData);

    return this.findByUserIdOrFail(userId);
  }

  async findPublicByHandle(handle: string): Promise<CompanyProfile> {
    const profile = await this.findByHandle(handle);
    if (!profile) {
      throw new NotFoundException('Perfil não encontrado.');
    }
    return profile;
  }
}
