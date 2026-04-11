import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from './experience.entity.js';
import { ExperienceController } from './experience.controller.js';
import { ExperienceService } from './experience.service.js';
import { DevProfileModule } from '../dev-profile/dev-profile.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Experience]),
    DevProfileModule,
  ],
  controllers: [ExperienceController],
  providers: [ExperienceService],
  exports: [ExperienceService],
})
export class ExperienceModule {}
