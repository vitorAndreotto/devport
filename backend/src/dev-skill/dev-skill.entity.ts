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
import { SkillTree } from '../skill-tree/skill-tree.entity.js';

@Entity('dev_skills')
export class DevSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'dev_profile_id', type: 'uuid' })
  devProfileId: string;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @Column({ type: 'varchar', length: 15 })
  level: string;

  @Column({ name: 'years_experience', type: 'integer', nullable: true })
  yearsExperience: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => DevProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dev_profile_id' })
  devProfile: DevProfile;

  @ManyToOne(() => SkillTree, { eager: true })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillTree;
}
