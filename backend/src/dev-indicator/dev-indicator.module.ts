import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchScore } from '../matching/infrastructure/match-score.entity.js';
import { Job } from '../job/job.entity.js';
import { JobSkill } from '../job/job-skill.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { DevProfileModule } from '../dev-profile/dev-profile.module.js';
import { MatchingModule } from '../matching/matching.module.js';
import { DevIndicatorService } from './dev-indicator.service.js';
import { DevIndicatorController } from './dev-indicator.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchScore, Job, JobSkill, DevSkill, JobApplication, DevProfile]),
    DevProfileModule,
    MatchingModule,
  ],
  controllers: [DevIndicatorController],
  providers: [DevIndicatorService],
})
export class DevIndicatorModule {}
