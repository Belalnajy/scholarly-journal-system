import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const emailPass = this.configService.get<string>('EMAIL_PASSWORD') || 'vxgd udzy okjp rrjb';
    
    this.logger.log(`Email User: ${emailUser ? 'Found' : 'Missing'}`);
    this.logger.log(`Email Pass: ${emailPass ? 'Found' : 'Missing'}`);
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: 'استعادة كلمة المرور - مجلة البحوث والدراسات',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              direction: rtl;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #093059 0%, #0a4070 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content p {
              color: #333333;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 30px;
            }
            .code-container {
              background-color: #f8f9fa;
              border: 2px dashed #093059;
              border-radius: 8px;
              padding: 30px;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #093059;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fff3cd;
              border-right: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              text-align: right;
            }
            .warning p {
              color: #856404;
              margin: 0;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #6c757d;
              font-size: 14px;
            }
            .footer p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 استعادة كلمة المرور</h1>
            </div>
            <div class="content">
              <p>مرحباً،</p>
              <p>لقد تلقينا طلباً لاستعادة كلمة المرور الخاصة بحسابك في مجلة البحوث والدراسات.</p>
              <p>استخدم الرمز التالي لإكمال عملية استعادة كلمة المرور:</p>
              
              <div class="code-container">
                <div class="code">${resetCode}</div>
              </div>
              
              <div class="warning">
                <p><strong>⚠️ تنبيه أمني:</strong></p>
                <p>• هذا الرمز صالح لمدة 15 دقيقة فقط</p>
                <p>• لا تشارك هذا الرمز مع أي شخص</p>
                <p>• إذا لم تطلب استعادة كلمة المرور، يرجى تجاهل هذه الرسالة</p>
              </div>
              
              <p style="margin-top: 30px;">إذا كان لديك أي استفسار، يرجى التواصل معنا.</p>
            </div>
            <div class="footer">
              <p><strong>مجلة البحوث والدراسات</strong></p>
              <p>نظام إدارة الأبحاث العلمية</p>
              <p style="margin-top: 15px; color: #999;">
                هذه رسالة تلقائية، يرجى عدم الرد عليها
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      throw new Error('فشل في إرسال البريد الإلكتروني');
    }
  }

  async sendPasswordResetSuccessEmail(email: string): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: 'تم تغيير كلمة المرور بنجاح - مجلة البحوث والدراسات',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
              direction: rtl;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: #ffffff;
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .content p {
              color: #333333;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 20px;
            }
            .success-icon {
              font-size: 64px;
              margin: 20px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-right: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              text-align: right;
            }
            .warning p {
              color: #856404;
              margin: 0;
              font-size: 14px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              color: #6c757d;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ تم تغيير كلمة المرور</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <p><strong>مرحباً،</strong></p>
              <p>تم تغيير كلمة المرور الخاصة بحسابك بنجاح.</p>
              <p>يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
              
              <div class="warning">
                <p><strong>⚠️ لم تقم بهذا التغيير؟</strong></p>
                <p>إذا لم تقم بتغيير كلمة المرور، يرجى التواصل معنا فوراً لتأمين حسابك.</p>
              </div>
            </div>
            <div class="footer">
              <p><strong>مجلة البحوث والدراسات</strong></p>
              <p>نظام إدارة الأبحاث العلمية</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset success email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send success email to ${email}`, error);
      // Don't throw error here, as password was already reset
    }
  }
}
