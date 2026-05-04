import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Matches,
  MaxLength,
  ArrayMaxSize,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobSkillDto } from './job-skill.dto.js';

enum Seniority {
  Intern = 'intern',
  Junior = 'junior',
  Mid = 'mid',
  Senior = 'senior',
  Lead = 'lead',
  Specialist = 'specialist',
}

enum ContractModel {
  Clt = 'clt',
  Pj = 'pj',
  CltPj = 'clt_pj',
}

enum WorkMode {
  Onsite = 'onsite',
  Hybrid = 'hybrid',
  Remote = 'remote',
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Seniority)
  seniority: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => JobSkillDto)
  skills: JobSkillDto[];

  @IsInt()
  @Min(0)
  @Type(() => Number)
  min_experience_years: number;

  @IsEnum(ContractModel)
  contract_model: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary_clt_min?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary_clt_max?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary_pj_min?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary_pj_max?: number;

  @IsOptional()
  @IsBoolean()
  show_salary?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  benefits?: string[];

  @IsEnum(WorkMode)
  work_mode: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  max_radius_km?: number;

  @IsOptional()
  @IsString()
  company_unit_id?: string;

  // --- Address (required if onsite/hybrid) ---

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  city_id?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido. Formato: 00000-000' })
  zip_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  complement?: string;
}
