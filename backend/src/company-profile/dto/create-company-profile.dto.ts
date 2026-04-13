import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum CompanySize {
  Startup = 'startup',
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Enterprise = 'enterprise',
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

export class CreateCompanyProfileDto {
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
  company_name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ inválido. Formato: 00.000.000/0000-00',
  })
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  logo_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  website?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  industry: string;

  @IsEnum(CompanySize)
  size: string;

  // --- Address (sede) ---

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
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}
