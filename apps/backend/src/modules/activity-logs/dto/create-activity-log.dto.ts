import {
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
} from 'class-validator';
import { ActivityAction } from '../../../database/entities/activity-log.entity';

export class CreateActivityLogDto {
  @IsOptional()
  @IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
  user_id?: string;

  @IsOptional()
  @IsUUID('4', { message: 'معرف البحث غير صحيح' })
  research_id?: string;

  @IsEnum(ActivityAction, { message: 'نوع الإجراء غير صحيح' })
  action_type!: ActivityAction;

  @IsString({ message: 'الوصف يجب أن يكون نصاً' })
  description!: string;

  @IsOptional()
  @IsObject({ message: 'البيانات الإضافية يجب أن تكون كائن JSON' })
  metadata?: Record<string, any>;
}
