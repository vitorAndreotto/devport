import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Experience } from './experience.entity.js';
import { SkillTree } from '../skill-tree/skill-tree.entity.js';

@Entity('experience_skills')
export class ExperienceSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'experience_id', type: 'uuid' })
  experienceId: string;

  @Column({ name: 'skill_id', type: 'uuid' })
  skillId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Experience, (exp) => exp.experienceSkills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'experience_id' })
  experience: Experience;

  @ManyToOne(() => SkillTree, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'skill_id' })
  skill: SkillTree;
}
