import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchScore } from './match-score.entity.js';
import { MatchingService } from './matching.service.js';
import { MatchFilterService } from './match-filter.service.js';
import { City } from '../location/city.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { Experience } from '../experience/experience.entity.js';
import { Job } from '../job/job.entity.js';
import { redisProvider } from './redis.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([MatchScore, City, JobApplication, DevProfile, DevSkill, Experience, Job])],
  providers: [MatchingService, MatchFilterService, redisProvider],
  exports: [MatchingService, MatchFilterService, redisProvider],
})
export class MatchingModule {}
