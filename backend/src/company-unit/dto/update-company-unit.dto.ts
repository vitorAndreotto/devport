import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyUnitDto } from './create-company-unit.dto.js';

export class UpdateCompanyUnitDto extends PartialType(CreateCompanyUnitDto) {}
