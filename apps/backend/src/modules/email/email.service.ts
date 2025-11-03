import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { getEmailTemplate } from './email-templates';

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

  async sendWelcomeEmail(
    email: string,
    name: string,
    role: string,
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    
    const roleText = role === 'researcher' ? 'باحث' : role === 'reviewer' ? 'محكم' : role === 'editor' ? 'محرر' : 'مستخدم';
    
    const content = `
      <p>مرحباً <strong>${name}</strong>،</p>
      <p>نرحب بك في <strong>مجلة البحوث والدراسات</strong>!</p>
      <p>تم إنشاء حسابك بنجاح كـ <strong>${roleText}</strong>.</p>
      
      <div class="info-box">
        <p><strong>معلومات حسابك:</strong></p>
        <p>البريد الإلكتروني: ${email}</p>
        <p>الدور: ${roleText}</p>
      </div>
      
      <p>يمكنك الآن تسجيل الدخول والبدء في استخدام المنصة:</p>
      
      ${role === 'researcher' ? `
        <ul style="text-align: right; line-height: 2;">
          <li>تقديم الأبحاث العلمية</li>
          <li>متابعة حالة أبحاثك</li>
          <li>الرد على ملاحظات المحكمين</li>
          <li>تعديل وتحديث أبحاثك</li>
        </ul>
      ` : role === 'reviewer' ? `
        <ul style="text-align: right; line-height: 2;">
          <li>استلام طلبات التحكيم</li>
          <li>مراجعة وتقييم الأبحاث</li>
          <li>تقديم الملاحظات والتوصيات</li>
        </ul>
      ` : role === 'editor' ? `
        <ul style="text-align: right; line-height: 2;">
          <li>إدارة الأبحاث المقدمة</li>
          <li>تعيين المحكمين</li>
          <li>متابعة عملية التحكيم</li>
          <li>اتخاذ القرارات النهائية</li>
        </ul>
      ` : ''}
      
      <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>
      <p>نتمنى لك تجربة ممتعة ومثمرة!</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: 'مرحباً بك في مجلة البحوث والدراسات',
      html: getEmailTemplate('مرحباً بك في المجلة', content, '#093059'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      throw error;
    }
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

  // Research submission notification to researcher
  async sendResearchSubmittedEmail(
    email: string,
    researcherName: string,
    researchTitle: string,
    researchNumber: string
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const content = `
      <p>عزيزي/عزيزتي <strong>${researcherName}</strong>،</p>
      <p>تم استلام بحثك بنجاح في نظام مجلة البحوث والدراسات.</p>
      
      <div class="info-box">
        <p><strong>عنوان البحث:</strong> ${researchTitle}</p>
        <p><strong>رقم البحث:</strong> ${researchNumber}</p>
        <p><strong>الحالة:</strong> قيد المراجعة</p>
      </div>
      
      <p>سيتم مراجعة بحثك من قبل المحكمين المتخصصين، وسنقوم بإشعارك بأي تحديثات عبر البريد الإلكتروني.</p>
      <p>شكراً لثقتكم بمجلتنا.</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: `تم استلام بحثك - ${researchTitle}`,
      html: getEmailTemplate('📝 تم تقديم البحث بنجاح', content, '#28a745'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Research submission email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send research submission email to ${email}`, error);
    }
  }

  // Reviewer assignment notification
  async sendReviewerAssignmentEmail(
    email: string,
    reviewerName: string,
    researchTitle: string,
    researchNumber: string
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const content = `
      <p>عزيزي/عزيزتي الدكتور/ة <strong>${reviewerName}</strong>،</p>
      <p>تم تعيينك كمحكم لبحث جديد في مجلة البحوث والدراسات.</p>
      
      <div class="info-box">
        <p><strong>عنوان البحث:</strong> ${researchTitle}</p>
        <p><strong>رقم البحث:</strong> ${researchNumber}</p>
      </div>
      
      <p>يرجى تسجيل الدخول إلى لوحة التحكم لمراجعة البحث وقبول أو رفض التحكيم.</p>
      <p>نشكر لكم تعاونكم المستمر.</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: `تعيين تحكيم جديد - ${researchTitle}`,
      html: getEmailTemplate('🎯 تعيين تحكيم جديد', content, '#0D3B66'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Reviewer assignment email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send reviewer assignment email to ${email}`, error);
    }
  }

  // Research accepted notification
  async sendResearchAcceptedEmail(
    email: string,
    researcherName: string,
    researchTitle: string,
    researchNumber: string
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const content = `
      <p>عزيزي/عزيزتي <strong>${researcherName}</strong>،</p>
      <p>🎉 نبارك لك! تم قبول بحثك للنشر في مجلة البحوث والدراسات.</p>
      
      <div class="info-box">
        <p><strong>عنوان البحث:</strong> ${researchTitle}</p>
        <p><strong>رقم البحث:</strong> ${researchNumber}</p>
        <p><strong>الحالة:</strong> مقبول للنشر</p>
      </div>
      
      <p>سيتم التواصل معك قريباً بخصوص إجراءات النشر النهائية.</p>
      <p>تهانينا على هذا الإنجاز العلمي!</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: `🎉 تم قبول بحثك - ${researchTitle}`,
      html: getEmailTemplate('✅ تم قبول البحث', content, '#28a745'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Research accepted email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send research accepted email to ${email}`, error);
    }
  }

  // Research rejected notification
  async sendResearchRejectedEmail(
    email: string,
    researcherName: string,
    researchTitle: string,
    researchNumber: string
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const content = `
      <p>عزيزي/عزيزتي <strong>${researcherName}</strong>،</p>
      <p>نشكرك على تقديم بحثك إلى مجلة البحوث والدراسات.</p>
      
      <div class="info-box">
        <p><strong>عنوان البحث:</strong> ${researchTitle}</p>
        <p><strong>رقم البحث:</strong> ${researchNumber}</p>
        <p><strong>الحالة:</strong> مرفوض</p>
      </div>
      
      <p>بعد المراجعة الدقيقة من قبل المحكمين المتخصصين، نأسف لإبلاغك بأن بحثك لم يستوف معايير النشر في المجلة في الوقت الحالي.</p>
      <p>يمكنك الاطلاع على ملاحظات المحكمين من خلال لوحة التحكم.</p>
      <p>نتمنى لك التوفيق في أبحاثك المستقبلية.</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: `نتيجة مراجعة البحث - ${researchTitle}`,
      html: getEmailTemplate('📋 نتيجة المراجعة', content, '#dc3545'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Research rejected email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send research rejected email to ${email}`, error);
    }
  }

  // Research needs revision notification
  async sendResearchNeedsRevisionEmail(
    email: string,
    researcherName: string,
    researchTitle: string,
    researchNumber: string
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const content = `
      <p>عزيزي/عزيزتي <strong>${researcherName}</strong>،</p>
      <p>تم مراجعة بحثك من قبل المحكمين المتخصصين.</p>
      
      <div class="info-box">
        <p><strong>عنوان البحث:</strong> ${researchTitle}</p>
        <p><strong>رقم البحث:</strong> ${researchNumber}</p>
        <p><strong>الحالة:</strong> يحتاج تعديلات</p>
      </div>
      
      <p>البحث يحتاج إلى بعض التعديلات بناءً على ملاحظات المحكمين.</p>
      <p>يرجى تسجيل الدخول إلى لوحة التحكم لمراجعة الملاحظات وتقديم النسخة المعدلة.</p>
      <p>نتطلع لاستلام النسخة المحدثة من بحثك.</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: email,
      subject: `البحث يحتاج تعديلات - ${researchTitle}`,
      html: getEmailTemplate('📝 البحث يحتاج تعديلات', content, '#ffc107'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Research needs revision email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send research needs revision email to ${email}`, error);
    }
  }

  // Admin notification for new research submission
  async sendAdminNewResearchEmail(
    adminEmail: string,
    researchTitle: string,
    researchNumber: string,
    researcherName: string
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const content = `
      <p>تم تقديم بحث جديد في النظام.</p>
      
      <div class="info-box">
        <p><strong>عنوان البحث:</strong> ${researchTitle}</p>
        <p><strong>رقم البحث:</strong> ${researchNumber}</p>
        <p><strong>الباحث:</strong> ${researcherName}</p>
      </div>
      
      <p>يرجى مراجعة البحث وتعيين المحكمين المناسبين.</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: adminEmail,
      subject: `بحث جديد - ${researchTitle}`,
      html: getEmailTemplate('📬 بحث جديد في النظام', content, '#0D3B66'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Admin new research email sent to ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send admin new research email to ${adminEmail}`, error);
    }
  }

  // Reviewer acceptance notification to admin
  async sendReviewerAcceptedEmail(
    adminEmail: string,
    reviewerName: string,
    researchTitle: string,
    researchNumber: string
  ): Promise<void> {
    const emailUser = this.configService.get<string>('EMAIL_USER') || 'journalresearchut@gmail.com';
    const content = `
      <p>قام المحكم بقبول تحكيم البحث.</p>
      
      <div class="info-box">
        <p><strong>المحكم:</strong> ${reviewerName}</p>
        <p><strong>عنوان البحث:</strong> ${researchTitle}</p>
        <p><strong>رقم البحث:</strong> ${researchNumber}</p>
      </div>
      
      <p>يمكنك متابعة حالة التحكيم من لوحة التحكم.</p>
    `;

    const mailOptions = {
      from: `"مجلة البحوث والدراسات" <${emailUser}>`,
      to: adminEmail,
      subject: `قبول تحكيم - ${researchTitle}`,
      html: getEmailTemplate('✅ قبول تحكيم', content, '#28a745'),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Reviewer accepted email sent to ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send reviewer accepted email to ${adminEmail}`, error);
    }
  }
}
