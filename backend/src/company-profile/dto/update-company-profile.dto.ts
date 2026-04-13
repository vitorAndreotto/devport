import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyProfileDto } from './create-company-profile.dto.js';

export class UpdateCompanyProfileDto extends PartialType(CreateCompanyProfileDto) {}
