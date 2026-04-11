import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillTree } from './skill-tree.entity.js';
import { SkillTreeController } from './skill-tree.controller.js';
import { SkillTreeService } from './skill-tree.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([SkillTree])],
  controllers: [SkillTreeController],
  providers: [SkillTreeService],
  exports: [SkillTreeService, TypeOrmModule],
})
export class SkillTreeModule {}
