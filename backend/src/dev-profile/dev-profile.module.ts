import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevProfile } from './dev-profile.entity.js';
import { DevProfileService } from './dev-profile.service.js';
import { DevProfileController, DeveloperProfileController } from './dev-profile.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([DevProfile])],
  controllers: [DevProfileController, DeveloperProfileController],
  providers: [DevProfileService],
  exports: [DevProfileService],
})
export class DevProfileModule {}
