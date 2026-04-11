import { Controller, Get, Query } from '@nestjs/common';
import { SkillTreeService } from './skill-tree.service.js';
import { ListSkillsQueryDto } from './dto/list-skills-query.dto.js';

@Controller('skills')
export class SkillTreeController {
  constructor(private readonly skillTreeService: SkillTreeService) {}

  @Get()
  async list(@Query() query: ListSkillsQueryDto) {
    return this.skillTreeService.list(query.category, query.q, query.parent_id);
  }

  @Get('categories')
  async categories() {
    return this.skillTreeService.listCategories();
  }
}
