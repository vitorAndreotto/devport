import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DevProfile } from '../../dev-profile/dev-profile.entity.js';
import { Job } from '../../job/job.entity.js';

@Entity('match_scores')
@Unique(['devProfileId', 'jobId'])
export class MatchScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dev_profile_id', type: 'uuid' })
  devProfileId: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ type: 'integer' })
  score: number;

  @Column({ name: 'dev_hash', type: 'varchar', length: 32 })
  devHash: string;

  @Column({ name: 'job_hash', type: 'varchar', length: 32 })
  jobHash: string;

  @Column({ name: 'skill_score', type: 'decimal', precision: 5, scale: 2 })
  skillScore: number;

  @Column({ name: 'experience_score', type: 'decimal', precision: 5, scale: 2 })
  experienceScore: number;

  @Column({ name: 'modality_score', type: 'decimal', precision: 5, scale: 2 })
  modalityScore: number;

  @Column({ name: 'salary_score', type: 'decimal', precision: 5, scale: 2 })
  salaryScore: number;

  @Column({ name: 'calculated_at', type: 'timestamp', default: () => 'now()' })
  calculatedAt: Date;

  @ManyToOne(() => DevProfile)
  @JoinColumn({ name: 'dev_profile_id' })
  devProfile: DevProfile;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
