import { IsUUID, IsObject, IsString, IsEnum, IsOptional, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { ReviewRecommendation, ReviewStatus } from '../../../database/entities/review.entity';

export class CreateReviewDto {
  @IsUUID('4', { message: 'معرف البحث يجب أن يكون UUID صحيح' })
  research_id!: string;

  @IsUUID('4', { message: 'معرف المحكم يجب أن يكون UUID صحيح' })
  reviewer_id!: string;

  @IsObject({ message: 'تقييمات المعايير يجب أن تكون object' })
  criteria_ratings!: Record<string, number>;

  @IsString({ message: 'التعليقات العامة يجب أن تكون نص' })
  general_comments!: string;

  @IsEnum(ReviewRecommendation, { message: 'التوصية غير صحيحة' })
  recommendation!: ReviewRecommendation;

  @IsOptional()
  @IsNumber({}, { message: 'متوسط التقييم يجب أن يكون رقم' })
  @Min(1, { message: 'متوسط التقييم يجب أن يكون على الأقل 1' })
  @Max(5, { message: 'متوسط التقييم يجب أن يكون على الأكثر 5' })
  average_rating?: number;

  @IsOptional()
  @IsEnum(ReviewStatus, { message: 'حالة المراجعة غير صحيحة' })
  status?: ReviewStatus;

  @IsOptional()
  @IsDateString({}, { message: 'الموعد النهائي يجب أن يكون تاريخ صحيح' })
  deadline?: string;

  @IsOptional()
  @IsNumber({}, { message: 'الدرجة الإجمالية يجب أن تكون رقم' })
  @Min(0, { message: 'الدرجة الإجمالية يجب أن تكون على الأقل 0' })
  @Max(100, { message: 'الدرجة الإجمالية يجب أن تكون على الأكثر 100' })
  total_score?: number;

  @IsOptional()
  @IsObject({ message: 'الدرجات التفصيلية يجب أن تكون object' })
  detailed_scores?: {
    title_score?: number;
    abstract_score?: number;
    methodology_score?: number;
    background_score?: number;
    results_score?: number;
    documentation_score?: number;
    originality_score?: number;
    formatting_score?: number;
    research_condition_score?: number;
    sources_score?: number;
  };
}
