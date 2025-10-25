import { IsString } from 'class-validator';

export class SubmitRevisionDto {
  @IsString()
  file_url: string;
}
