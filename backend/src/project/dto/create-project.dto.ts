import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  technologies?: string[];

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  repository_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  demo_url?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  image_url?: string;
}
