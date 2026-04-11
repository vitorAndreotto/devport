import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, IsNull } from 'typeorm';
import { SkillTree } from './skill-tree.entity.js';

@Injectable()
export class SkillTreeService {
  constructor(
    @InjectRepository(SkillTree)
    private readonly skillRepo: Repository<SkillTree>,
  ) {}

  async list(category?: string, query?: string, parentId?: string): Promise<SkillTree[]> {
    const where: Record<string, unknown> = {};

    if (category) {
      where['category'] = category;
    }
    if (query) {
      where['name'] = ILike(`%${query}%`);
    }
    if (parentId === 'null') {
      where['parentId'] = IsNull();
    } else if (parentId) {
      where['parentId'] = parentId;
    }

    return this.skillRepo.find({
      where,
      relations: ['children'],
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async listCategories(): Promise<string[]> {
    const result = await this.skillRepo
      .createQueryBuilder('s')
      .select('DISTINCT s.category', 'category')
      .orderBy('s.category', 'ASC')
      .getRawMany();

    return result.map((r: { category: string }) => r.category);
  }
}
