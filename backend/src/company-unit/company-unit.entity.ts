import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CompanyProfile } from '../company-profile/company-profile.entity.js';
import { City } from '../location/city.entity.js';

@Entity('company_units')
export class CompanyUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_profile_id', type: 'uuid' })
  companyProfileId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'city_id', type: 'integer' })
  cityId: number;

  @Column({ name: 'zip_code', type: 'varchar', length: 9 })
  zipCode: string;

  @Column({ type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 255 })
  neighborhood: string;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  complement: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // --- Relationships ---

  @ManyToOne(() => CompanyProfile)
  @JoinColumn({ name: 'company_profile_id' })
  companyProfile: CompanyProfile;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city: City;
}
