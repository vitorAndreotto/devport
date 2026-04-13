import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyProfile } from './company-profile.entity.js';
import { CompanyProfileService } from './company-profile.service.js';
import { CompanyProfileController, CompanyPublicController } from './company-profile.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyProfile])],
  controllers: [CompanyProfileController, CompanyPublicController],
  providers: [CompanyProfileService],
  exports: [CompanyProfileService],
})
export class CompanyProfileModule {}
