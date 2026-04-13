import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchScore } from './match-score.entity.js';
import { MatchingService } from './matching.service.js';
import { redisProvider } from './redis.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([MatchScore])],
  providers: [MatchingService, redisProvider],
  exports: [MatchingService],
})
export class MatchingModule {}
