import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyUnit } from './company-unit.entity.js';
import { CreateCompanyUnitDto } from './dto/create-company-unit.dto.js';
import { UpdateCompanyUnitDto } from './dto/update-company-unit.dto.js';

@Injectable()
export class CompanyUnitService {
  constructor(
    @InjectRepository(CompanyUnit)
    private readonly unitRepo: Repository<CompanyUnit>,
  ) {}

  async findByCompanyProfileId(companyProfileId: string): Promise<CompanyUnit[]> {
    return this.unitRepo.find({
      where: { companyProfileId },
      order: { name: 'ASC' },
    });
  }

  async create(companyProfileId: string, dto: CreateCompanyUnitDto): Promise<CompanyUnit> {
    const unit = this.unitRepo.create({
      companyProfileId,
      name: dto.name,
      cityId: dto.city_id,
      zipCode: dto.zip_code,
      street: dto.street,
      neighborhood: dto.neighborhood,
      number: dto.number,
      complement: dto.complement ?? null,
    });

    return this.unitRepo.save(unit);
  }

  async update(companyProfileId: string, unitId: string, dto: UpdateCompanyUnitDto): Promise<CompanyUnit> {
    const unit = await this.findOneOrFail(unitId, companyProfileId);

    const updateData: Partial<CompanyUnit> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.city_id !== undefined) updateData.cityId = dto.city_id;
    if (dto.zip_code !== undefined) updateData.zipCode = dto.zip_code;
    if (dto.street !== undefined) updateData.street = dto.street;
    if (dto.neighborhood !== undefined) updateData.neighborhood = dto.neighborhood;
    if (dto.number !== undefined) updateData.number = dto.number;
    if (dto.complement !== undefined) updateData.complement = dto.complement ?? null;

    await this.unitRepo.update(unit.id, updateData);

    return this.findOneOrFail(unitId, companyProfileId);
  }

  async remove(companyProfileId: string, unitId: string): Promise<void> {
    const unit = await this.findOneOrFail(unitId, companyProfileId);
    await this.unitRepo.remove(unit);
  }

  private async findOneOrFail(unitId: string, companyProfileId: string): Promise<CompanyUnit> {
    const unit = await this.unitRepo.findOne({ where: { id: unitId } });
    if (!unit) {
      throw new NotFoundException('Unidade não encontrada.');
    }
    if (unit.companyProfileId !== companyProfileId) {
      throw new ForbiddenException('Sem permissão para acessar esta unidade.');
    }
    return unit;
  }
}
