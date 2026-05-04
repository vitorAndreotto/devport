import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { MatchScore } from './match-score.entity.js';
import { MatchResult } from '../domain/types.js';
import { MatchScoreRepository, PersistedMatchScore } from '../ports/match-score.repository.js';

/**
 * Adapter TypeORM para MatchScoreRepository — implementa a porta usando
 * o entity MatchScore (TypeORM/Postgres).
 */
@Injectable()
export class TypeOrmMatchScoreRepository implements MatchScoreRepository {
  constructor(
    @InjectRepository(MatchScore)
    private readonly repo: Repository<MatchScore>,
  ) {}

  async findOne(devProfileId: string, jobId: string): Promise<PersistedMatchScore | null> {
    const row = await this.repo.findOne({ where: { devProfileId, jobId } });
    return row ? this.toPersisted(row) : null;
  }

  async findByDevAndJobs(devProfileId: string, jobIds: string[]): Promise<PersistedMatchScore[]> {
    if (jobIds.length === 0) return [];
    const rows = await this.repo.find({
      where: { devProfileId, jobId: In(jobIds) },
    });
    return rows.map((r) => this.toPersisted(r));
  }

  async upsert(devProfileId: string, jobId: string, result: MatchResult): Promise<void> {
    await this.repo.query(
      `INSERT INTO match_scores (id, dev_profile_id, job_id, score, dev_hash, job_hash,
                                 skill_score, experience_score, modality_score, salary_score, calculated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (dev_profile_id, job_id) DO UPDATE SET
         score = EXCLUDED.score,
         dev_hash = EXCLUDED.dev_hash,
         job_hash = EXCLUDED.job_hash,
         skill_score = EXCLUDED.skill_score,
         experience_score = EXCLUDED.experience_score,
         modality_score = EXCLUDED.modality_score,
         salary_score = EXCLUDED.salary_score,
         calculated_at = now()`,
      [
        devProfileId, jobId, result.score, result.devHash, result.jobHash,
        result.skillScore, result.experienceScore, result.modalityScore, result.salaryScore,
      ],
    );
  }

  async delete(devProfileId: string, jobId: string): Promise<void> {
    await this.repo.delete({ devProfileId, jobId });
  }

  private toPersisted(row: MatchScore): PersistedMatchScore {
    return {
      devProfileId: row.devProfileId,
      jobId: row.jobId,
      score: row.score,
      skillScore: Number(row.skillScore),
      experienceScore: Number(row.experienceScore),
      modalityScore: Number(row.modalityScore),
      salaryScore: Number(row.salaryScore),
      devHash: row.devHash,
      jobHash: row.jobHash,
    };
  }
}
