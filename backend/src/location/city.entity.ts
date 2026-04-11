import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { State } from './state.entity.js';

@Entity('cities')
export class City {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'state_id', type: 'integer' })
  stateId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  longitude: number;

  @Column({ name: 'is_capital', type: 'boolean', default: false })
  isCapital: boolean;

  @Column({ name: 'siafi_id', type: 'integer' })
  siafiId: number;

  @Column({ type: 'integer' })
  ddd: number;

  @Column({ name: 'timezone', type: 'varchar', length: 50 })
  timezone: string;

  @ManyToOne(() => State, (state) => state.cities)
  @JoinColumn({ name: 'state_id' })
  state: State;
}
