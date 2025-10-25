import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { IssueStatus } from '../../../database/entities/issue.entity';

export class CreateIssueDto {
  @IsString({ message: 'رقم العدد يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم العدد مطلوب' })
  @MaxLength(50, { message: 'رقم العدد يجب ألا يتجاوز 50 حرفاً' })
  issue_number!: string;

  @IsString({ message: 'عنوان العدد يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'عنوان العدد مطلوب' })
  @MaxLength(500, { message: 'عنوان العدد يجب ألا يتجاوز 500 حرف' })
  title!: string;

  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'تاريخ النشر يجب أن يكون تاريخاً صحيحاً' })
  @IsNotEmpty({ message: 'تاريخ النشر مطلوب' })
  publish_date!: string;

  @IsInt({ message: 'الحد الأقصى للمقالات يجب أن يكون رقماً صحيحاً' })
  @Min(1, { message: 'الحد الأقصى للمقالات يجب أن يكون على الأقل 1' })
  @IsOptional()
  max_articles?: number;

  @IsString({ message: 'رابط صورة الغلاف يجب أن يكون نصاً' })
  @IsOptional()
  cover_image_url?: string;

  @IsEnum(IssueStatus, { message: 'حالة العدد غير صحيحة' })
  @IsOptional()
  status?: IssueStatus;

  @IsInt({ message: 'نسبة التقدم يجب أن تكون رقماً صحيحاً' })
  @Min(0, { message: 'نسبة التقدم يجب أن تكون على الأقل 0' })
  @Max(100, { message: 'نسبة التقدم يجب ألا تتجاوز 100' })
  @IsOptional()
  progress_percentage?: number;
}
