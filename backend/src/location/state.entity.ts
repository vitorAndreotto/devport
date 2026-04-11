import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { City } from './city.entity.js';

@Entity('states')
export class State {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 2, unique: true })
  abbr: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ type: 'varchar', length: 20 })
  region: string;

  @OneToMany(() => City, (city) => city.state)
  cities: City[];
}
