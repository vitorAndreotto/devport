import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevSkill } from './dev-skill.entity.js';
import { CreateDevSkillDto } from './dto/create-dev-skill.dto.js';
import { UpdateDevSkillDto } from './dto/update-dev-skill.dto.js';
import { DevProfileService } from '../dev-profile/dev-profile.service.js';
import { SkillTree } from '../skill-tree/skill-tree.entity.js';

@Injectable()
export class DevSkillService {
  private readonly MAX_SKILLS = 50;

  constructor(
    @InjectRepository(DevSkill)
    private readonly devSkillRepo: Repository<DevSkill>,
    @InjectRepository(SkillTree)
    private readonly skillTreeRepo: Repository<SkillTree>,
    private readonly devProfileService: DevProfileService,
  ) {}

  async listByUser(userId: string): Promise<DevSkill[]> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    return this.devSkillRepo.find({
      where: { devProfileId: profile.id },
      relations: ['skill'],
      order: { skill: { name: 'ASC' } },
    });
  }

  async create(userId: string, dto: CreateDevSkillDto): Promise<DevSkill> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    const skillExists = await this.skillTreeRepo.findOne({ where: { id: dto.skill_id } });
    if (!skillExists) {
      throw new NotFoundException('Skill não encontrada na árvore.');
    }

    const count = await this.devSkillRepo.count({ where: { devProfileId: profile.id } });
    if (count >= this.MAX_SKILLS) {
      throw new BadRequestException('Limite de 50 skills atingido.');
    }

    const exists = await this.devSkillRepo.findOne({
      where: { devProfileId: profile.id, skillId: dto.skill_id },
    });
    if (exists) {
      throw new ConflictException('Skill já cadastrada no perfil.');
    }

    const devSkill = this.devSkillRepo.create({
      devProfileId: profile.id,
      skillId: dto.skill_id,
      level: dto.level,
      yearsExperience: dto.years_experience ?? null,
    });

    const saved = await this.devSkillRepo.save(devSkill);

    return this.devSkillRepo.findOneOrFail({
      where: { id: saved.id },
      relations: ['skill'],
    });
  }

  async update(userId: string, devSkillId: string, dto: UpdateDevSkillDto): Promise<DevSkill> {
    const devSkill = await this.findOwnedOrFail(userId, devSkillId);

    if (dto.skill_id && dto.skill_id !== devSkill.skillId) {
      const skillExists = await this.skillTreeRepo.findOne({ where: { id: dto.skill_id } });
      if (!skillExists) {
        throw new NotFoundException('Skill não encontrada na árvore.');
      }

      const duplicate = await this.devSkillRepo.findOne({
        where: { devProfileId: devSkill.devProfileId, skillId: dto.skill_id },
      });
      if (duplicate) {
        throw new ConflictException('Skill já cadastrada no perfil.');
      }
    }

    const updateData: Partial<DevSkill> = {};
    if (dto.skill_id !== undefined) updateData.skillId = dto.skill_id;
    if (dto.level !== undefined) updateData.level = dto.level;
    if (dto.years_experience !== undefined) updateData.yearsExperience = dto.years_experience ?? null;

    await this.devSkillRepo.update(devSkillId, updateData);

    return this.devSkillRepo.findOneOrFail({
      where: { id: devSkillId },
      relations: ['skill'],
    });
  }

  async remove(userId: string, devSkillId: string): Promise<void> {
    const devSkill = await this.findOwnedOrFail(userId, devSkillId);
    await this.devSkillRepo.remove(devSkill);
  }

  private async findOwnedOrFail(userId: string, devSkillId: string): Promise<DevSkill> {
    const profile = await this.devProfileService.findByUserIdOrFail(userId);

    const devSkill = await this.devSkillRepo.findOne({
      where: { id: devSkillId },
      relations: ['skill'],
    });

    if (!devSkill) {
      throw new NotFoundException('Skill não encontrada.');
    }

    if (devSkill.devProfileId !== profile.id) {
      throw new ForbiddenException('Sem permissão.');
    }

    return devSkill;
  }
}
