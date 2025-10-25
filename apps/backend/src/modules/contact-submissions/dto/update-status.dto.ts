import { IsEnum } from 'class-validator';
import { ContactSubmissionStatus } from '../../../database/entities/contact-submission.entity';

export class UpdateStatusDto {
  @IsEnum(ContactSubmissionStatus, { message: 'حالة الرسالة غير صحيحة' })
  status!: ContactSubmissionStatus;
}
