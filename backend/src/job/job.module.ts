import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity.js';
import { JobSkill } from './job-skill.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { Experience } from '../experience/experience.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { JobService } from './job.service.js';
import { CompanyJobController, PublicJobController } from './job.controller.js';
import { CompanyProfileModule } from '../company-profile/company-profile.module.js';
import { MatchingModule } from '../matching/matching.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobSkill, JobApplication, DevProfile, Experience, DevSkill]),
    CompanyProfileModule,
    MatchingModule,
  ],
  controllers: [CompanyJobController, PublicJobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
