import { IsOptional, IsString, MaxLength, IsUUID, IsIn } from 'class-validator';

const VALID_CATEGORIES = [
  'language', 'framework', 'database', 'devops',
  'tool', 'methodology', 'soft_skill', 'other',
];

export class ListSkillsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(VALID_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(36)
  parent_id?: string;
}
