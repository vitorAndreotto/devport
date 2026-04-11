import { PartialType } from '@nestjs/mapped-types';
import { CreateDevProfileDto } from './create-dev-profile.dto.js';

export class UpdateDevProfileDto extends PartialType(CreateDevProfileDto) {}
