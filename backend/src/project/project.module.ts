import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './project.entity.js';
import { ProjectController } from './project.controller.js';
import { ProjectService } from './project.service.js';
import { DevProfileModule } from '../dev-profile/dev-profile.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    DevProfileModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
