import { IsNotEmpty, IsEnum, IsOptional, IsInt, IsString, Matches, Min } from 'class-validator';

enum SkillLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
}

export class CreateDevSkillDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    message: 'skill_id deve ser um UUID válido.',
  })
  skill_id: string;

  @IsEnum(SkillLevel)
  @IsNotEmpty()
  level: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  years_experience?: number;
}
