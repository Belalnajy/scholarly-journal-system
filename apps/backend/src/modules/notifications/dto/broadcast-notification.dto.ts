import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { NotificationType } from '../../../database/entities/notification.entity';

export class BroadcastNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsOptional()
  action_url?: string;
}
