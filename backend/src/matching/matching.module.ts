import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain entity (TypeORM detail) — only used to wire repository
import { MatchScore } from './infrastructure/match-score.entity.js';
import { City } from '../location/city.entity.js';
import { JobApplication } from '../job-application/job-application.entity.js';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { DevSkill } from '../dev-skill/dev-skill.entity.js';
import { Experience } from '../experience/experience.entity.js';
import { Job } from '../job/job.entity.js';

// Application services (orchestrator + facade)
import { MatchingService } from './matching.service.js';
import { MatchFilterService } from './match-filter.service.js';

// Ports (tokens) and adapters (concrete impls)
import {
  MATCH_SCORE_REPOSITORY,
  MATCH_SCORE_CACHE,
  APPLICATION_STATUS_READER,
  CITY_GEO_LOADER,
  DEV_JOB_DATA_LOADER,
} from './ports/tokens.js';
import { TypeOrmMatchScoreRepository } from './infrastructure/typeorm-match-score-repository.js';
import { RedisMatchScoreCache } from './infrastructure/redis-match-score-cache.js';
import { TypeOrmApplicationStatusReader } from './infrastructure/typeorm-application-status-reader.js';
import { TypeOrmCityGeoLoader } from './infrastructure/typeorm-city-geo-loader.js';
import { TypeOrmDevJobDataLoader } from './infrastructure/typeorm-dev-job-data-loader.js';

import { redisProvider } from './redis.provider.js';

/**
 * Hexagonal-lite wiring:
 *  - `providers` mapeia tokens → adapters concretos
 *  - `MatchingService` e `MatchFilterService` consomem tokens via @Inject
 *  - Trocar adapter (ex: redis → memcached) e mudar so esta secao
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([MatchScore, City, JobApplication, DevProfile, DevSkill, Experience, Job]),
  ],
  providers: [
    redisProvider,
    // Adapters concretos
    TypeOrmMatchScoreRepository,
    RedisMatchScoreCache,
    TypeOrmApplicationStatusReader,
    TypeOrmCityGeoLoader,
    TypeOrmDevJobDataLoader,
    // Bind das portas → adapters
    { provide: MATCH_SCORE_REPOSITORY,    useExisting: TypeOrmMatchScoreRepository },
    { provide: MATCH_SCORE_CACHE,         useExisting: RedisMatchScoreCache },
    { provide: APPLICATION_STATUS_READER, useExisting: TypeOrmApplicationStatusReader },
    { provide: CITY_GEO_LOADER,           useExisting: TypeOrmCityGeoLoader },
    { provide: DEV_JOB_DATA_LOADER,       useExisting: TypeOrmDevJobDataLoader },
    // Application services
    MatchingService,
    MatchFilterService,
  ],
  exports: [MatchingService, MatchFilterService, redisProvider],
})
export class MatchingModule {}
