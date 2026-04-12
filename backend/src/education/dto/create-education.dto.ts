import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  IsIn,
  Min,
  MaxLength,
} from 'class-validator';

const EDUCATION_TYPES = [
  'technical', 'graduation', 'master', 'doctorate',
  'postdoc', 'mba', 'course', 'certification',
];

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  institution: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  course: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(EDUCATION_TYPES)
  type: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  workload_hours?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  is_ongoing?: boolean;
}
