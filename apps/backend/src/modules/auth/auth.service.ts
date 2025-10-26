import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('حسابك غير نشط. يرجى التواصل مع الإدارة');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    // Remove password from user object
    const { password: _, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatar_url: user.avatar_url,
      },
    };
  }

  async validateToken(payload: any) {
    // This is called by JwtStrategy
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('حسابك غير نشط');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }

  // Password Reset Methods
  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('البريد الإلكتروني غير مسجل في النظام');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new BadRequestException('حسابك غير نشط. يرجى التواصل مع الإدارة');
    }

    // Generate 6-digit code
    const resetCode = this.generateResetCode();

    // Calculate expiration time (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Delete any existing unused tokens for this email
    await this.passwordResetTokenRepository.delete({
      email,
      is_used: false,
    });

    // Create new reset token
    const resetToken = this.passwordResetTokenRepository.create({
      email,
      token: resetCode,
      user_id: user.id,
      expires_at: expiresAt,
      is_used: false,
    });

    await this.passwordResetTokenRepository.save(resetToken);

    // Send email
    await this.emailService.sendPasswordResetEmail(email, resetCode);

    return {
      message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
    };
  }

  async verifyResetCode(
    email: string,
    code: string,
  ): Promise<{ message: string; valid: boolean }> {
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        email,
        token: code,
        is_used: false,
      },
    });

    if (!resetToken) {
      throw new BadRequestException('رمز التحقق غير صحيح');
    }

    // Check if token is expired
    if (new Date() > resetToken.expires_at) {
      throw new BadRequestException('رمز التحقق منتهي الصلاحية. يرجى طلب رمز جديد');
    }

    return {
      message: 'رمز التحقق صحيح',
      valid: true,
    };
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Verify code first
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: {
        email,
        token: code,
        is_used: false,
      },
    });

    if (!resetToken) {
      throw new BadRequestException('رمز التحقق غير صحيح');
    }

    // Check if token is expired
    if (new Date() > resetToken.expires_at) {
      throw new BadRequestException('رمز التحقق منتهي الصلاحية. يرجى طلب رمز جديد');
    }

    // Get user
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.usersService.updatePassword(user.id, hashedPassword);

    // Mark token as used
    resetToken.is_used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    // Send success email
    await this.emailService.sendPasswordResetSuccessEmail(email);

    return {
      message: 'تم تغيير كلمة المرور بنجاح',
    };
  }

  async resendResetCode(email: string): Promise<{ message: string }> {
    // Just call forgotPassword again
    return this.forgotPassword(email);
  }

  // Cleanup expired tokens (can be called by a cron job)
  async cleanupExpiredTokens(): Promise<void> {
    await this.passwordResetTokenRepository.delete({
      expires_at: LessThan(new Date()),
    });
  }
}
