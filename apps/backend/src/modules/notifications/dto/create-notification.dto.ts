import {
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { NotificationType } from '../../../database/entities/notification.entity';

export class CreateNotificationDto {
  @IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
  user_id!: string;

  @IsEnum(NotificationType, { message: 'نوع الإشعار غير صحيح' })
  type!: NotificationType;

  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  @MaxLength(255, { message: 'العنوان يجب ألا يتجاوز 255 حرفاً' })
  title!: string;

  @IsString({ message: 'الرسالة يجب أن تكون نصاً' })
  message!: string;

  @IsOptional()
  @IsString({ message: 'رابط الإجراء يجب أن يكون نصاً' })
  @MaxLength(500, { message: 'رابط الإجراء يجب ألا يتجاوز 500 حرفاً' })
  action_url?: string;
}
