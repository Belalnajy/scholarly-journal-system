import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  password!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['researcher', 'reviewer', 'editor', 'admin'])
  role?: string;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsString()
  affiliation?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsEnum([
    'bachelor',
    'master',
    'phd',
    'assistant-professor',
    'associate-professor',
    'professor',
  ])
  academic_degree?: string;

  @IsOptional()
  @IsString()
  orcid_id?: string;

  @IsOptional()
  @IsString()
  google_scholar_id?: string;

  @IsOptional()
  @IsString()
  research_gate_id?: string;

  @IsOptional()
  @IsString()
  research_interests?: string;

  @IsOptional()
  @IsString()
  expertise_areas?: string;

  @IsOptional()
  @IsString()
  languages_spoken?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  years_of_experience?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  number_of_publications?: number;

  @IsOptional()
  @IsString()
  bio?: string;
}
