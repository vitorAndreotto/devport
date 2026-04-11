import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('skill_tree')
export class SkillTree {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 20 })
  category: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => SkillTree, (skill) => skill.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: SkillTree | null;

  @OneToMany(() => SkillTree, (skill) => skill.parent)
  children: SkillTree[];
}
