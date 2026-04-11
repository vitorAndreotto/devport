import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './state.entity.js';
import { City } from './city.entity.js';
import { LocationController } from './location.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([State, City])],
  controllers: [LocationController],
})
export class LocationModule {}
