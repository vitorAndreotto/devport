import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CompanyProfile } from '../company-profile/company-profile.entity.js';
import { CompanyUnit } from '../company-unit/company-unit.entity.js';
import { City } from '../location/city.entity.js';
import { JobSkill } from './job-skill.entity.js';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_profile_id', type: 'uuid' })
  companyProfileId: string;

  @Column({ name: 'company_unit_id', type: 'uuid', nullable: true })
  companyUnitId: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 15 })
  seniority: string;

  @Column({ name: 'min_experience_years', type: 'integer' })
  minExperienceYears: number;

  @Column({ name: 'contract_model', type: 'varchar', length: 10 })
  contractModel: string;

  @Column({ name: 'salary_clt_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryCltMin: number | null;

  @Column({ name: 'salary_clt_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryCltMax: number | null;

  @Column({ name: 'salary_pj_min', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryPjMin: number | null;

  @Column({ name: 'salary_pj_max', type: 'decimal', precision: 10, scale: 2, nullable: true })
  salaryPjMax: number | null;

  @Column({ name: 'show_salary', type: 'boolean', default: false })
  showSalary: boolean;

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[] | null;

  @Column({ name: 'work_mode', type: 'varchar', length: 10 })
  workMode: string;

  @Column({ name: 'max_radius_km', type: 'integer', nullable: true })
  maxRadiusKm: number | null;

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

  @Column({ type: 'varchar', length: 10, default: 'open' })
  status: string;

  @Column({ name: 'match_dirty', type: 'boolean', default: true })
  matchDirty: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => CompanyProfile)
  @JoinColumn({ name: 'company_profile_id' })
  companyProfile: CompanyProfile;

  @ManyToOne(() => CompanyUnit)
  @JoinColumn({ name: 'company_unit_id' })
  companyUnit: CompanyUnit;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @OneToMany(() => JobSkill, (js) => js.job, { cascade: true })
  skills: JobSkill[];
}
