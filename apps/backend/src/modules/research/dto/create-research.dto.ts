import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ResearchStatus } from '../../../database/entities/research.entity';

export class CreateResearchDto {
  @IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
  @IsNotEmpty({ message: 'معرف المستخدم مطلوب' })
  user_id!: string;

  @IsString({ message: 'رقم البحث يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم البحث مطلوب' })
  @MaxLength(50, { message: 'رقم البحث يجب ألا يتجاوز 50 حرفاً' })
  research_number!: string;

  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  @MaxLength(500, { message: 'العنوان يجب ألا يتجاوز 500 حرف' })
  title!: string;

  @IsString({ message: 'العنوان بالإنجليزية يجب أن يكون نصاً' })
  @IsOptional()
  @MaxLength(500, { message: 'العنوان بالإنجليزية يجب ألا يتجاوز 500 حرف' })
  title_en?: string;

  @IsString({ message: 'الملخص يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الملخص مطلوب' })
  abstract!: string;

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
  @IsNotEmpty({ message: 'التخصص مطلوب' })
  @MaxLength(255, { message: 'التخصص يجب ألا يتجاوز 255 حرفاً' })
  specialization!: string;

  @IsEnum(ResearchStatus, { message: 'حالة البحث غير صحيحة' })
  @IsOptional()
  status?: ResearchStatus;

  @IsString({ message: 'رابط الملف يجب أن يكون نصاً' })
  @IsOptional()
  file_url?: string;

  @IsUUID('4', { message: 'معرف المقال المنشور غير صحيح' })
  @IsOptional()
  published_article_id?: string;
}
