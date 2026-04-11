import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListCitiesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}
