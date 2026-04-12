import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DevProfile } from '../dev-profile/dev-profile.entity.js';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dev_profile_id', type: 'uuid' })
  devProfileId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  technologies: string[] | null;

  @Column({ name: 'repository_url', type: 'varchar', length: 2048, nullable: true })
  repositoryUrl: string | null;

  @Column({ name: 'demo_url', type: 'varchar', length: 2048, nullable: true })
  demoUrl: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 10, default: 'manual' })
  source: string;

  @Column({ name: 'github_repo_id', type: 'bigint', nullable: true })
  githubRepoId: string | null;

  @Column({ name: 'github_stars', type: 'integer', nullable: true })
  githubStars: number | null;

  @Column({ name: 'github_language', type: 'varchar', length: 100, nullable: true })
  githubLanguage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DevProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dev_profile_id' })
  devProfile: DevProfile;
}
