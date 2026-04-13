import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';
import { Job } from '../job/job.entity.js';

@Entity('job_applications')
@Unique(['devProfileId', 'jobId'])
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dev_profile_id', type: 'uuid' })
  devProfileId: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ type: 'varchar', length: 10, default: 'pending' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => DevProfile)
  @JoinColumn({ name: 'dev_profile_id' })
  devProfile: DevProfile;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
