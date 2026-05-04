import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { MatchBatchProducer } from './match-batch.producer.js';

/**
 * Trigger manual do batch matching. Usado para backfill / dev tools.
 * Requer autenticacao mas sem restricao de role — qualquer user logado pode disparar.
 */
@Controller('admin/match-batch')
@UseGuards(JwtAuthGuard)
export class MatchBatchController {
  constructor(private readonly producer: MatchBatchProducer) {}

  @Post('run')
  async run() {
    const stats = await this.producer.runNow();
    return {
      message: 'Batch enqueued',
      ...stats,
    };
  }
}
