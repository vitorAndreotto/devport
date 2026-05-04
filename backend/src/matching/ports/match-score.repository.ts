import { MatchResult } from '../domain/types.js';

/** Linha persistida do match_score (subset usado pelo dominio). */
export interface PersistedMatchScore {
  devProfileId: string;
  jobId: string;
  score: number;
  skillScore: number;
  experienceScore: number;
  modalityScore: number;
  salaryScore: number;
  devHash: string;
  jobHash: string;
}

/**
 * Port para persistencia de match scores.
 * Adapter padrao: TypeOrmMatchScoreRepository (Postgres via TypeORM).
 */
export interface MatchScoreRepository {
  findOne(devProfileId: string, jobId: string): Promise<PersistedMatchScore | null>;
  findByDevAndJobs(devProfileId: string, jobIds: string[]): Promise<PersistedMatchScore[]>;
  upsert(devProfileId: string, jobId: string, result: MatchResult): Promise<void>;
  delete(devProfileId: string, jobId: string): Promise<void>;
}
