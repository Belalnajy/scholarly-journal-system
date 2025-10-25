import { IsUUID, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ReviewerAssignmentStatus } from '../../../database/entities/reviewer-assignment.entity';

export class CreateReviewerAssignmentDto {
  @IsUUID('4', { message: 'معرف البحث يجب أن يكون UUID صحيح' })
  research_id!: string;

  @IsUUID('4', { message: 'معرف المحكم يجب أن يكون UUID صحيح' })
  reviewer_id!: string;

  @IsUUID('4', { message: 'معرف المُعيِّن يجب أن يكون UUID صحيح' })
  assigned_by!: string;

  @IsOptional()
  @IsString({ message: 'ملاحظات التعيين يجب أن تكون نص' })
  assignment_notes?: string;

  @IsDateString({}, { message: 'الموعد النهائي يجب أن يكون تاريخ صحيح' })
  deadline!: string;

  @IsOptional()
  @IsEnum(ReviewerAssignmentStatus, { message: 'حالة التعيين غير صحيحة' })
  status?: ReviewerAssignmentStatus;
}
