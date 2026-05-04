import { MatchResult } from '../domain/types.js';

/**
 * Port para cache de match scores. TTL e nivel "common vs relevant" sao
 * controlados pelo orchestrator via parametro `relevant`.
 *
 * Adapter padrao: RedisMatchScoreCache.
 */
export interface MatchScoreCache {
  get(devProfileId: string, jobId: string): Promise<MatchResult | null>;
  /** Pipeline batch: retorna o resultado por job_id na mesma ordem dos ids. */
  getMany(devProfileId: string, jobIds: string[]): Promise<(MatchResult | null)[]>;
  set(devProfileId: string, jobId: string, result: MatchResult, relevant: boolean): Promise<void>;
  /** Pipeline batch otimizado pra populacao em massa. */
  setMany(devProfileId: string, entries: { jobId: string; result: MatchResult; relevant: boolean }[]): Promise<void>;
  invalidateDev(devProfileId: string): Promise<void>;
  invalidateJob(jobId: string): Promise<void>;
}
