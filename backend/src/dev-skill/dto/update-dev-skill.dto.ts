import { PartialType } from '@nestjs/mapped-types';
import { CreateDevSkillDto } from './create-dev-skill.dto.js';

export class UpdateDevSkillDto extends PartialType(CreateDevSkillDto) {}
