import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  IsEnum,
  MaxLength,
  ValidateNested,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleStatus } from '../../../database/entities/article.entity';

export class AuthorDto {
  @IsString({ message: 'اسم المؤلف يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم المؤلف مطلوب' })
  name!: string;

  @IsString({ message: 'الانتماء يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الانتماء مطلوب' })
  affiliation!: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email!: string;
}

export class CreateArticleDto {
  @IsUUID('4', { message: 'معرف البحث غير صحيح' })
  @IsOptional()
  research_id?: string;

  @IsUUID('4', { message: 'معرف العدد غير صحيح' })
  @IsNotEmpty({ message: 'معرف العدد مطلوب' })
  issue_id!: string;

  @IsString({ message: 'رقم المقال يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم المقال مطلوب' })
  @MaxLength(50, { message: 'رقم المقال يجب ألا يتجاوز 50 حرفاً' })
  article_number!: string;

  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  @MaxLength(500, { message: 'العنوان يجب ألا يتجاوز 500 حرف' })
  title!: string;

  @IsString({ message: 'العنوان بالإنجليزية يجب أن يكون نصاً' })
  @IsOptional()
  @MaxLength(500, { message: 'العنوان بالإنجليزية يجب ألا يتجاوز 500 حرف' })
  title_en?: string;

  @IsArray({ message: 'المؤلفون يجب أن يكونوا مصفوفة' })
  @ValidateNested({ each: true })
  @Type(() => AuthorDto)
  @IsOptional() // Optional - will be populated from research if empty
  authors?: AuthorDto[];

  @IsString({ message: 'الملخص يجب أن يكون نصاً' })
  @IsOptional() // Optional - will be populated from research if not provided
  abstract?: string;

  @IsString({ message: 'الملخص بالإنجليزية يجب أن يكون نصاً' })
  @IsOptional()
  abstract_en?: string;

  @IsArray({ message: 'الكلمات المفتاحية يجب أن تكون مصفوفة' })
  @IsOptional()
  keywords?: string[];

  @IsArray({ message: 'الكلمات المفتاحية بالإنجليزية يجب أن تكون مصفوفة' })
  @IsOptional()
  keywords_en?: string[];

  @IsString({ message: 'التخصص يجب أن يكون نصاً' })
  @IsOptional()
  @MaxLength(255, { message: 'التخصص يجب ألا يتجاوز 255 حرفاً' })
  specialization?: string;

  @IsString({ message: 'الصفحات يجب أن تكون نصاً' })
  @IsOptional()
  pages?: string; // "1-15"

  @IsString({ message: 'DOI يجب أن يكون نصاً' })
  @IsOptional()
  @MaxLength(255, { message: 'DOI يجب ألا يتجاوز 255 حرفاً' })
  doi?: string;

  @IsString({ message: 'رابط الملف يجب أن يكون نصاً' })
  @IsOptional() // Optional - will be populated from research if not provided
  pdf_url?: string;

  @IsEnum(ArticleStatus, { message: 'حالة المقال غير صحيحة' })
  @IsOptional()
  status?: ArticleStatus;

  @IsDateString({}, { message: 'تاريخ النشر غير صحيح' })
  @IsOptional()
  published_date?: string;
}
