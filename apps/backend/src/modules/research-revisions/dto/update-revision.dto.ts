import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { RevisionStatus } from '../../../database/entities/research-revision.entity';

export class UpdateRevisionDto {
  @IsOptional()
  @IsString()
  revision_notes?: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsEnum(RevisionStatus)
  status?: RevisionStatus;

  @IsOptional()
  @IsDateString()
  submitted_at?: string;
}
