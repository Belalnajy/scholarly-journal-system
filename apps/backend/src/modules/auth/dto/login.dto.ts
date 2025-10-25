import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نص' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password: string;
}
