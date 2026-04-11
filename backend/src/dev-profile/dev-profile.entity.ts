import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity.js';
import { City } from '../location/city.entity.js';

@Entity('dev_profiles')
export class DevProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  handle: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  bio: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 2048, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'email_contact', type: 'varchar', length: 255 })
  emailContact: string;

  // --- Address ---

  @Column({ name: 'city_id', type: 'integer', nullable: true })
  cityId: number | null;

  @Column({ name: 'zip_code', type: 'varchar', length: 9, nullable: true })
  zipCode: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  neighborhood: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  number: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complement: string | null;

  // ---

  @Column({ name: 'work_mode', type: 'varchar', length: 10, nullable: true })
  workMode: string | null;

  @Column({ name: 'github_username', type: 'varchar', length: 255, nullable: true })
  githubUsername: string | null;

  @Column({ type: 'jsonb', nullable: true })
  links: { label: string; url: string }[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relationships ---

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;
}
