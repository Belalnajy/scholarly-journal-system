import {
  IsString,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  site_name?: string;

  @IsOptional()
  @IsString()
  site_name_en?: string;

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
    address?: string;
    fax?: string;
  };

  @IsOptional()
  @IsObject()
  social_links?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };

  @IsOptional()
  @IsBoolean()
  is_maintenance_mode?: boolean;

  @IsOptional()
  @IsString()
  maintenance_message?: string;
}
