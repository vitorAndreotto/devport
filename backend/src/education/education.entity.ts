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

@Entity('educations')
export class Education {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dev_profile_id', type: 'uuid' })
  devProfileId: string;

  @Column({ type: 'varchar', length: 255 })
  institution: string;

  @Column({ type: 'varchar', length: 255 })
  course: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ name: 'workload_hours', type: 'integer', nullable: true })
  workloadHours: number | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ name: 'is_ongoing', type: 'boolean', default: false })
  isOngoing: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DevProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dev_profile_id' })
  devProfile: DevProfile;
}
