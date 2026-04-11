import { Controller, Get, Query } from '@nestjs/common';
import { SkillTreeService } from './skill-tree.service.js';

@Controller('skills')
export class SkillTreeController {
  constructor(private readonly skillTreeService: SkillTreeService) {}

  @Get()
  async list(
    @Query('category') category?: string,
    @Query('q') query?: string,
    @Query('parent_id') parentId?: string,
  ) {
    return this.skillTreeService.list(category, query, parentId);
  }

  @Get('categories')
  async categories() {
    return this.skillTreeService.listCategories();
  }
}
