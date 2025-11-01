import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  site_name?: string;

  @IsOptional()
  @IsString()
  site_name_en?: string;

  @IsOptional()
  @IsString()
  journal_doi?: string;

  @IsOptional()
  @IsString()
  journal_url?: string;

  @IsOptional()
  @IsString()
  journal_issn?: string;

  @IsOptional()
  @IsString()
  university_url?: string;

  @IsOptional()
  @IsString()
  logo_url?: string;

  @IsOptional()
  @IsString()
  favicon_url?: string;

  @IsOptional()
  @IsString()
  about_intro?: string;

  @IsOptional()
  @IsString()
  mission?: string;

  @IsOptional()
  @IsString()
  vision?: string;

  @IsOptional()
  @IsArray()
  goals?: string[];

  @IsOptional()
  @IsObject()
  contact_info?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    fax?: string;
    whatsapp_numbers?: Array<{
      number: string;
      label: string;
    }>;
  };

  @IsOptional()
  @IsObject()
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
    whatsapp_channel?: string;
  };

  @IsOptional()
  @IsBoolean()
  is_maintenance_mode?: boolean;

  @IsOptional()
  @IsString()
  maintenance_message?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseFloat(value);
    }
    return value;
  })
  @IsNumber()
  submission_fee?: number;

  @IsOptional()
  @IsString()
  submission_fee_currency?: string;

  @IsOptional()
  @IsString()
  payment_instructions?: string;

  @IsOptional()
  @IsString()
  acceptance_letter_content?: string;
}
