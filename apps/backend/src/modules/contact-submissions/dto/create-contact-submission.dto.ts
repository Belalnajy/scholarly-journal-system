import {
  IsEmail,
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactSubmissionDto {
  @IsOptional()
  @IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
  user_id?: string;

  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' })
  @MaxLength(255, { message: 'الاسم يجب ألا يتجاوز 255 حرفاً' })
  name!: string;
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @MaxLength(255, { message: 'البريد الإلكتروني يجب ألا يتجاوز 255 حرفاً' })
  email!: string;

  @IsString({ message: 'الموضوع يجب أن يكون نصاً' })
  @MinLength(2, { message: 'الموضوع يجب أن يكون حرفين على الأقل' })
  @MaxLength(500, { message: 'الموضوع يجب ألا يتجاوز 500 حرفاً' })
  subject!: string;

  @IsString({ message: 'الرسالة يجب أن تكون نصاً' })
  @MinLength(10, { message: 'الرسالة يجب أن تكون 10 أحرف على الأقل' })
  message!: string;
}
