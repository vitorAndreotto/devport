import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity.js';
import { SkillTree } from '../skill-tree/skill-tree.entity.js';

@Entity('job_skills')
export class JobSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @Column({ name: 'min_level', type: 'varchar', length: 15 })
  minLevel: string;

  @Column({ type: 'varchar', length: 15, default: 'required' })
  requirement: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // --- Relationships ---

  @ManyToOne(() => Job, (job) => job.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => SkillTree)
  @JoinColumn({ name: 'skill_id' })
  skill: SkillTree;
}
