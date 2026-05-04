import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis.provider.js';
import { MatchScoreCache } from '../ports/match-score.cache.js';
import { MatchResult } from '../domain/types.js';
import { REDIS_TTL_DEFAULT, REDIS_TTL_RELEVANT } from '../domain/constants.js';

/**
 * Adapter Redis para MatchScoreCache — encapsula o key format e os TTLs
 * (DEFAULT pra match comum, RELEVANT pra match relevante).
 */
@Injectable()
export class RedisMatchScoreCache implements MatchScoreCache {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  private key(devProfileId: string, jobId: string): string {
    return `match:${devProfileId}:${jobId}`;
  }

  async get(devProfileId: string, jobId: string): Promise<MatchResult | null> {
    const raw = await this.redis.get(this.key(devProfileId, jobId));
    return raw ? (JSON.parse(raw) as MatchResult) : null;
  }

  async getMany(devProfileId: string, jobIds: string[]): Promise<(MatchResult | null)[]> {
    if (jobIds.length === 0) return [];
    const pipeline = this.redis.pipeline();
    for (const jobId of jobIds) pipeline.get(this.key(devProfileId, jobId));
    const results = await pipeline.exec();
    return jobIds.map((_, i) => {
      const [err, value] = results![i];
      if (err || !value) return null;
      try {
        return JSON.parse(value as string) as MatchResult;
      } catch {
        return null;
      }
    });
  }

  async set(devProfileId: string, jobId: string, result: MatchResult, relevant: boolean): Promise<void> {
    const ttl = relevant ? REDIS_TTL_RELEVANT : REDIS_TTL_DEFAULT;
    await this.redis.set(this.key(devProfileId, jobId), JSON.stringify(result), 'EX', ttl);
  }

  async setMany(
    devProfileId: string,
    entries: { jobId: string; result: MatchResult; relevant: boolean }[],
  ): Promise<void> {
    if (entries.length === 0) return;
    const pipeline = this.redis.pipeline();
    for (const e of entries) {
      const ttl = e.relevant ? REDIS_TTL_RELEVANT : REDIS_TTL_DEFAULT;
      pipeline.set(this.key(devProfileId, e.jobId), JSON.stringify(e.result), 'EX', ttl);
    }
    await pipeline.exec();
  }

  async invalidateDev(devProfileId: string): Promise<void> {
    const keys = await this.redis.keys(`match:${devProfileId}:*`);
    if (keys.length > 0) await this.redis.del(...keys);
  }

  async invalidateJob(jobId: string): Promise<void> {
    const keys = await this.redis.keys(`match:*:${jobId}`);
    if (keys.length > 0) await this.redis.del(...keys);
  }
}
