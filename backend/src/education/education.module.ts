import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Education } from './education.entity.js';
import { EducationController } from './education.controller.js';
import { EducationService } from './education.service.js';
import { DevProfileModule } from '../dev-profile/dev-profile.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Education]),
    DevProfileModule,
  ],
  controllers: [EducationController],
  providers: [EducationService],
  exports: [EducationService],
})
export class EducationModule {}
