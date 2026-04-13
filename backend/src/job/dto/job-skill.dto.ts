import { IsUUID, IsEnum, IsOptional, isString, IsString } from 'class-validator';

enum SkillLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
}

enum SkillRequirement {
  Required = 'required',
  Expected = 'expected',
  Differential = 'differential',
}

export class JobSkillDto {
  @IsString()
  skill_id: string;

  @IsEnum(SkillLevel)
  min_level: string;

  @IsOptional()
  @IsEnum(SkillRequirement)
  requirement?: string;
}
