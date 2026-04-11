import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevSkill } from './dev-skill.entity.js';
import { DevSkillController } from './dev-skill.controller.js';
import { DevSkillService } from './dev-skill.service.js';
import { DevProfileModule } from '../dev-profile/dev-profile.module.js';
import { SkillTreeModule } from '../skill-tree/skill-tree.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([DevSkill]),
    DevProfileModule,
    SkillTreeModule,
  ],
  controllers: [DevSkillController],
  providers: [DevSkillService],
  exports: [DevSkillService],
})
export class DevSkillModule {}
