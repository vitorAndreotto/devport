import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsArray,
  IsUrl,
  Min,
  Matches,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum WorkMode {
  Onsite = 'onsite',
  Hybrid = 'hybrid',
  Remote = 'remote',
}

enum EmploymentStatus {
  Looking = 'looking',
  Employed = 'employed',
}

class LinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @IsUrl()
  @IsNotEmpty()
  @MaxLength(2048)
  url: string;
}

export class CreateDevProfileDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'Handle deve conter apenas letras minúsculas, números e hífens, sem iniciar ou terminar com hífen.',
  })
  handle: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  bio: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  avatar_url?: string;

  @IsEmail()
  @IsNotEmpty()
  email_contact: string;

  // --- Address ---

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

  // ---

  @IsOptional()
  @IsArray()
  @IsEnum(WorkMode, { each: true })
  work_modes?: string[];

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employment_status?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary_min?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  salary_max?: number;

  @IsOptional()
  @IsString()
  @MaxLength(39)
  @Matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/, {
    message: 'Username do GitHub inválido.',
  })
  github_username?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}
