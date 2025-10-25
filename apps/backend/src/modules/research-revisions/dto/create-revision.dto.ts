import { IsString, IsUUID, IsOptional, IsDateString, IsObject } from 'class-validator';

export class CreateRevisionDto {
  @IsUUID()
  research_id: string;

  @IsString()
  revision_notes: string;

  @IsOptional()
  @IsObject()
  original_data?: {
    abstract?: string;
    keywords?: string[];
    file_url?: string;
  };

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
