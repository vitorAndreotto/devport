import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { Experience } from '../experience/experience.entity.js';
import { Job } from '../job/job.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { MatchingModule } from '../matching/matching.module.js';
import { MatchBatchProducer } from './match-batch.producer.js';
import { MatchBatchConsumer } from './match-batch.consumer.js';
import { MatchBatchController } from './match-batch.controller.js';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'match-batch' }),
    TypeOrmModule.forFeature([DevProfile, DevSkill, Experience, Job, JobApplication]),
    MatchingModule,
  ],
  controllers: [MatchBatchController],
  providers: [MatchBatchProducer, MatchBatchConsumer],
  exports: [MatchBatchProducer],
})
export class MatchBatchModule {}
