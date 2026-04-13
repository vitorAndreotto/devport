import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Matches,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyUnitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsInt()
  @Type(() => Number)
  city_id: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido. Formato: 00000-000' })
  zip_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  number: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  complement?: string;
}
