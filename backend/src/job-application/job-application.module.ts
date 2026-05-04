import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from './job-application.entity.js';
import { Job } from '../job/job.entity.js';
import { JobApplicationService } from './job-application.service.js';
import { DevApplicationController, CompanyApplicationController } from './job-application.controller.js';
import { DevProfileModule } from '../dev-profile/dev-profile.module.js';
import { CompanyProfileModule } from '../company-profile/company-profile.module.js';
import { MatchBatchModule } from '../match-batch/match-batch.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, Job]),
    DevProfileModule,
    CompanyProfileModule,
    MatchBatchModule,
  ],
  controllers: [DevApplicationController, CompanyApplicationController],
  providers: [JobApplicationService],
  exports: [JobApplicationService],
})
export class JobApplicationModule {}
