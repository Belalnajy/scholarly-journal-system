import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  MaxLength,
  IsNumber,
  Min,
} from 'class-validator';
import { FileCategory } from '../../../database/entities/research-file.entity';

export class CreateResearchFileDto {
  @IsUUID('4', { message: 'معرف البحث غير صحيح' })
  @IsNotEmpty({ message: 'معرف البحث مطلوب' })
  research_id!: string;

  @IsString({ message: 'اسم الملف يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم الملف مطلوب' })
  @MaxLength(255, { message: 'اسم الملف يجب ألا يتجاوز 255 حرفاً' })
  file_name!: string;

  @IsString({ message: 'رابط الملف يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رابط الملف مطلوب' })
  file_url!: string;

  @IsString({ message: 'نوع الملف يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'نوع الملف مطلوب' })
  @MaxLength(100, { message: 'نوع الملف يجب ألا يتجاوز 100 حرف' })
  file_type!: string;

  @IsNumber({}, { message: 'حجم الملف يجب أن يكون رقماً' })
  @Min(0, { message: 'حجم الملف يجب أن يكون موجباً' })
  file_size!: number;

  @IsEnum(FileCategory, { message: 'فئة الملف غير صحيحة' })
  @IsOptional()
  file_category?: FileCategory;
}
