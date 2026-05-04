import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { Job } from '../job/job.entity.js';
import { ConfigService } from '@nestjs/config';

export interface MatchBatchPayload {
  type: 'dirty-dev' | 'dirty-job' | 'pair';
  ids: string[];
  /** Quando type === 'pair': par especifico [devProfileId, jobId] */
  pair?: { devProfileId: string; jobId: string };
}

@Injectable()
export class MatchBatchProducer {
  private readonly logger = new Logger(MatchBatchProducer.name);
  private readonly chunkSize: number;

  constructor(
    @InjectQueue('match-batch')
    private readonly matchQueue: Queue,
    @InjectRepository(DevProfile)
    private readonly devProfileRepo: Repository<DevProfile>,
    @InjectRepository(Job)
    private readonly jobRepo: Repository<Job>,
    private readonly config: ConfigService,
  ) {
    this.chunkSize = this.config.get<number>('MATCH_BATCH_CHUNK_SIZE', 100);
  }

  /**
   * Enfileira um par especifico (devProfileId, jobId) pra ter o score calculado e
   * persistido o quanto antes. Disparado no momento da candidatura — o consumer
   * processa de forma assincrona e durable (sobrevive a restart do backend).
   */
  async enqueuePair(devProfileId: string, jobId: string): Promise<void> {
    await this.matchQueue.add('process-batch', {
      type: 'pair',
      ids: [],
      pair: { devProfileId, jobId },
    } satisfies MatchBatchPayload, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: 50,
    });
  }

  /**
   * Trigger manual: roda a mesma logica do cron imediatamente.
   * Util pra testes / backfill — exposto via endpoint admin.
   */
  async runNow(): Promise<{ devs: number; jobs: number }> {
    const dirtyDevs = await this.devProfileRepo.count({ where: { matchDirty: true } });
    const dirtyJobs = await this.jobRepo.count({ where: { matchDirty: true, status: 'open' } });
    await this.handleCron();
    return { devs: dirtyDevs, jobs: dirtyJobs };
  }

  @Cron(process.env.MATCH_BATCH_CRON ?? '0 */3 * * *')
  async handleCron(): Promise<void> {
    const devLimit = this.config.get<number>('MATCH_BATCH_DEV_LIMIT', 0);
    const jobLimit = this.config.get<number>('MATCH_BATCH_JOB_LIMIT', 0);

    this.logger.log('Batch matching started — detecting dirty entities...');

    const dirtyDevs = await this.devProfileRepo.find({
      where: { matchDirty: true },
      select: ['id'],
      ...(devLimit > 0 && { take: devLimit }),
    });

    const dirtyJobs = await this.jobRepo.find({
      where: { matchDirty: true, status: 'open' },
      select: ['id'],
      ...(jobLimit > 0 && { take: jobLimit }),
    });

    if (dirtyDevs.length === 0 && dirtyJobs.length === 0) {
      this.logger.log('No dirty entities found — skipping batch.');
      return;
    }

    this.logger.log(
      `Found ${dirtyDevs.length} dirty devs, ${dirtyJobs.length} dirty jobs`,
    );

    let enqueued = 0;

    // Enqueue dirty devs in chunks — each worker will match them against all open jobs
    const dirtyDevIds = dirtyDevs.map((d) => d.id);
    for (let i = 0; i < dirtyDevIds.length; i += this.chunkSize) {
      const chunk = dirtyDevIds.slice(i, i + this.chunkSize);
      await this.matchQueue.add('process-batch', { type: 'dirty-dev', ids: chunk } satisfies MatchBatchPayload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 50,
      });
      enqueued++;
    }

    // Enqueue dirty jobs in chunks — each worker will match them against all devs
    const dirtyJobIds = dirtyJobs.map((j) => j.id);
    for (let i = 0; i < dirtyJobIds.length; i += this.chunkSize) {
      const chunk = dirtyJobIds.slice(i, i + this.chunkSize);
      await this.matchQueue.add('process-batch', { type: 'dirty-job', ids: chunk } satisfies MatchBatchPayload, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: 50,
      });
      enqueued++;
    }

    this.logger.log(`Enqueued ${enqueued} batch jobs`);

    // Reset dirty flags
    if (dirtyDevIds.length > 0) {
      await this.devProfileRepo
        .createQueryBuilder()
        .update()
        .set({ matchDirty: false })
        .whereInIds(dirtyDevIds)
        .execute();
    }

    if (dirtyJobIds.length > 0) {
      await this.jobRepo
        .createQueryBuilder()
        .update()
        .set({ matchDirty: false })
        .whereInIds(dirtyJobIds)
        .execute();
    }

    this.logger.log('Dirty flags reset — batch matching enqueue complete.');
  }
}
