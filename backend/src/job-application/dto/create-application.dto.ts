import { IsString, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  job_id: string;
}
