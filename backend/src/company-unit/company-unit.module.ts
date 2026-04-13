import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyUnit } from './company-unit.entity.js';
import { CompanyUnitService } from './company-unit.service.js';
import { CompanyUnitController } from './company-unit.controller.js';
import { CompanyProfileModule } from '../company-profile/company-profile.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyUnit]), CompanyProfileModule],
  controllers: [CompanyUnitController],
  providers: [CompanyUnitService],
  exports: [CompanyUnitService],
})
export class CompanyUnitModule {}
