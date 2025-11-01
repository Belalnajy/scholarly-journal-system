import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Research } from '../../database/entities/research.entity';
import { User } from '../../database/entities/user.entity';
import { SiteSettings } from '../../database/entities/site-settings.entity';

@Injectable()
export class PdfGeneratorService {
  private async createBrowser() {
    // في بيئة الإنتاج، استخدم chromium المحسن
    if (process.env.NODE_ENV === 'production') {
      return await puppeteer.launch({
        args: chromium.args,
        defaultViewport: null,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    // في بيئة التطوير، حاول العثور على chromium المحلي
    const possiblePaths = [
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    // ابحث عن أول مسار متاح
    const fs = await import('fs');
    let executablePath = null;

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        executablePath = path;
        break;
      }
    }

    if (!executablePath) {
      // إذا لم نجد chromium محلي، استخدم chromium من المكتبة
      executablePath = await chromium.executablePath();
    }

    return await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });
  }

  private async getImageBase64(filename: string): Promise<string> {
    try {
      const fs = await import('fs');
      const path = await import('path');

      // المسارات المحتملة للصورة
      const possiblePaths = [
        path.join(process.cwd(), `apps/frontend/public/${filename}`),
        path.join(process.cwd(), `../frontend/public/${filename}`),
        path.join(__dirname, `../../../frontend/public/${filename}`),
      ];

      for (const imagePath of possiblePaths) {
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const base64Image = imageBuffer.toString('base64');
          return `data:image/png;base64,${base64Image}`;
        }
      }

      console.warn(
        `Image file ${filename} not found in any of the expected paths`
      );
      return '';
    } catch (error) {
      console.error(`Error loading image ${filename}:`, error);
      return '';
    }
  }

  private async getLogoBase64(): Promise<string> {
    return this.getImageBase64('logo-stamp.png');
  }

  private async getJournalLogoBase64(): Promise<string> {
    return this.getImageBase64('journal-logo.png');
  }

  private generateAcceptanceLetterHTML(
    research: Research,
    researcher: User,
    siteSettings: SiteSettings,
    logoBase64: string = '',
    journalLogoBase64: string = ''
  ): string {
    const acceptanceDate = research.evaluation_date || new Date();
    const formattedDate = new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(acceptanceDate);

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>خطاب قبول نشر - ${research.research_number}</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
      <style>
      @page {
        size: A4;
        margin: 0;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: "Amiri", "Cairo", serif;
        background: white;
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 0;
        position: relative;
      }

      /* إطار خارجي فاخر */
      .page-border {
        position: absolute;
        top: 12mm;
        left: 12mm;
        right: 12mm;
        bottom: 12mm;
        border: 2.5px solid #093059;
        border-radius: 4px;
      }

      .page-border::after {
        content: "";
        position: absolute;
        top: 3px;
        left: 3px;
        right: 3px;
        bottom: 3px;
        border: 1px solid #b2823e;
        border-radius: 3px;
      }

      /* زخارف الأركان */
      .corner {
        position: absolute;
        width: 35px;
        height: 35px;
        border-color: #b2823e;
        border-style: solid;
      }

      .corner.top-right {
        top: 10mm;
        right: 10mm;
        border-width: 2.5px 2.5px 0 0;
      }

      .corner.top-left {
        top: 10mm;
        left: 10mm;
        border-width: 2.5px 0 0 2.5px;
      }

      .corner.bottom-right {
        bottom: 10mm;
        right: 10mm;
        border-width: 0 2.5px 2.5px 0;
      }

      .corner.bottom-left {
        bottom: 10mm;
        left: 10mm;
        border-width: 0 0 2.5px 2.5px;
      }

      /* المحتوى */
      .content {
        position: relative;
        padding: 18mm 18mm 16mm 18mm;
        height: 100%;
      }

      /* الهيدر */
      .header {
        text-align: center;
        padding-bottom: 10px;
        margin-bottom: 15px;
        border-bottom: 2.5px double #093059;
        position: relative;
      }

      .header::after {
        content: "";
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 2.5px;
        background: linear-gradient(90deg, transparent, #b2823e, transparent);
      }

      .journal-logo {
        width: 75px;
        height: auto;
        margin: 0 auto 10px auto;
        display: block;
      }

      .journal-name {
        font-size: 22px;
        font-weight: 700;
        color: #093059;
        margin-bottom: 4px;
        letter-spacing: 0.3px;
      }

      .journal-name-en {
        font-size: 12px;
        font-weight: 600;
        color: #b2823e;
        letter-spacing: 1px;
        text-transform: uppercase;
        margin-bottom: 6px;
        font-family: "Cairo", sans-serif;
      }

      .journal-subtitle {
        font-size: 13px;
        color: #666;
        font-weight: 400;
        margin-bottom: 6px;
      }

      .journal-info {
        margin-top: 6px;
        padding-top: 6px;
        border-top: 1px solid #e0e0e0;
      }

      .journal-doi {
        font-size: 11px;
        color: #666;
        margin-bottom: 3px;
        direction: ltr;
        text-align: center;
        font-weight: 500;
      }

      .journal-url {
        font-size: 10px;
        color: #093059;
        direction: ltr;
        text-align: center;
        word-break: break-all;
        font-weight: 500;
      }

      /* عنوان الخطاب */
      .letter-title {
        text-align: center;
        font-size: 22px;
        font-weight: 700;
        color: white;
        background: linear-gradient(135deg, #093059 0%, #0d4a7a 100%);
        padding: 12px 22px;
        margin: 12px 0 18px 0;
        border-radius: 6px;
        box-shadow: 0 6px 18px rgba(9, 48, 89, 0.25);
        position: relative;
        letter-spacing: 0.5px;
      }

      .letter-title::before,
      .letter-title::after {
        content: "◆";
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        color: #b2823e;
        font-size: 14px;
      }

      .letter-title::before {
        right: 18px;
      }
      .letter-title::after {
        left: 18px;
      }

      /* التاريخ */
      .date {
        text-align: right;
        margin-bottom: 16px;
        font-size: 15px;
        color: #555;
        font-weight: 400;
      }

      /* التحية */
      .greeting {
        text-align: right;
        margin-bottom: 16px;
        padding: 12px 15px;
        background: linear-gradient(to left, #f8f9fa, white);
        border-right: 4px solid #093059;
        border-radius: 4px;
      }

      .greeting-name {
        font-size: 19px;
        font-weight: 700;
        color: #093059;
        margin-bottom: 6px;
      }

      .greeting-title {
        font-size: 17px;
        color: #333;
        margin-bottom: 6px;
        font-weight: 400;
      }

      .greeting-salutation {
        font-size: 17px;
        color: #333;
        font-weight: 500;
      }

      /* نص الخطاب */
      .letter-body {
        text-align: right;
        line-height: 2.2;
        font-size: 17px;
        color: #2c2c2c;
        font-weight: 400;
      }

      .letter-body p {
        margin-bottom: 16px;
        text-align: justify;
      }

      .letter-body p:first-child {
        font-size: 17px;
        font-weight: 500;
      }

      /* عنوان البحث */
      .research-title-box {
        margin: 16px 0;
        text-align: center;
      }

      .research-title {
        font-size: 19px;
        font-weight: 700;
        color: #093059;
        padding: 20px 24px;
        background: white;
        border: 2.5px solid transparent;
        background-image: linear-gradient(white, white),
          linear-gradient(135deg, #093059, #b2823e);
        background-origin: border-box;
        background-clip: padding-box, border-box;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(9, 48, 89, 0.12);
        position: relative;
        line-height: 1.9;
      }

      .research-title::before {
        content: "❝";
        position: absolute;
        top: -3px;
        right: 12px;
        font-size: 35px;
        color: #b2823e;
        opacity: 0.25;
        font-family: Georgia, serif;
      }

      .research-title::after {
        content: "❞";
        position: absolute;
        bottom: -12px;
        left: 12px;
        font-size: 35px;
        color: #b2823e;
        opacity: 0.25;
        font-family: Georgia, serif;
      }

      /* رقم البحث */
      .research-number {
        text-align: center;
        margin: 16px 0 18px 0;
        padding: 11px 18px;
        background: linear-gradient(to left, #f8f9fa, #e9ecef, #f8f9fa);
        border-radius: 6px;
        font-size: 17px;
        font-weight: 700;
        color: #093059;
        border-left: 3.5px solid #b2823e;
        border-right: 3.5px solid #b2823e;
      }

      /* التوقيع */
      .signature {
        margin-bottom: 100px;
        display: flex;
        justify-content: flex-end;
        padding-right: 40px;
        position: relative;
      }

      .signature-box {
        text-align: center;
        min-width: 180px;
      }

      .signature-title {
        font-size: 18px;
        font-weight: 700;
        color: #093059;
        margin-bottom: 28px;
      }

      .signature-line {
        width: 170px;
        height: 2px;
        background: linear-gradient(90deg, #093059, #b2823e);
        margin: 0 auto 2px auto;
      }

      .signature-name {
        font-size: 16px;
        color: #b2823e;
        font-weight: 700;
      }

      /* الختم الرسمي */
      .official-stamp {
        position: absolute;
        left: 140px;
        top: -90px;
        width: 90px;
        height: 80px;
        opacity: 0.85;
        filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
      }

      .official-stamp img {
        width: 200px;
        height: 200px;
        object-fit: contain;
      }

      /* الفوتر */
      .footer {
        position: absolute;
        bottom: 16mm;
        left: 22mm;
        right: 22mm;
        text-align: center;
        padding: 14px;
        background: linear-gradient(135deg, #093059, #0d4a7a);
        color: white;
        font-size: 12px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(9, 48, 89, 0.2);
      }

      .footer-content {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .footer-separator {
        color: #b2823e;
        font-weight: bold;
      }

      /* علامة مائية */
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 75px;
        font-weight: 800;
        color: rgba(9, 48, 89, 0.02);
        letter-spacing: 6px;
        pointer-events: none;
        white-space: nowrap;
      }

      @media print {
        body {
          width: 210mm;
          height: 297mm;
        }
        * {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    </style>
</head>
<body>
    <div class="watermark">مقبول للنشر</div>
    <div class="page-border"></div>
    <div class="corner top-right"></div>
    <div class="corner top-left"></div>
    <div class="corner bottom-right"></div>
    <div class="corner bottom-left"></div>
    
    <div class="content">
        <div class="header">
            ${
              journalLogoBase64
                ? `<img src="${journalLogoBase64}" alt="شعار المجلة" class="journal-logo">`
                : ''
            }
            <div class="journal-subtitle">مجلة علمية محكمة</div>
            <div class="journal-info">
                ${
                  siteSettings.journal_issn
                    ? `<div class="journal-issn">ISSN: ${siteSettings.journal_issn}</div>`
                    : ''
                }
                <div class="journal-doi">${siteSettings.journal_doi || ''}</div>
                <div class="journal-url">${siteSettings.journal_url || ''}</div>
            </div>
        </div>
        
        <div class="letter-title">خطاب قبول نشر</div>
        
        <div class="date">التاريخ: ${formattedDate}</div>
        
        <div class="greeting">
            <div class="greeting-name">الأستاذ الدكتور/ ${researcher.name}</div>
            <div class="greeting-title">المحترم</div>
            <div class="greeting-salutation">تحية طيبة وبعد،</div>
        </div>
        
        <div class="letter-body">
            <p>يسرنا أن نبلغكم بأن بحثكم العلمي الموسوم بعنوان:</p>
            
            <div class="research-title-box">
                <div class="research-title">${research.title}</div>
            </div>
            
            <div class="research-number">رقم البحث: ${
              research.research_number
            }</div>
            
            ${this.generateLetterContent(siteSettings)}
        </div>
        
        <div class="signature">
            ${
              logoBase64
                ? `<div class="official-stamp"><img src="${logoBase64}" alt="ختم رسمي"></div>`
                : ''
            }
            <div class="signature-box">
                <div class="signature-title">رئيس التحرير</div>
                <div class="signature-line"></div>
                <div class="signature-name">${
                  siteSettings.site_name || 'مجلة الدراسات والبحوث'
                }</div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <div class="footer-content">
            ${this.generateContactInfo(siteSettings)}
        </div>
    </div>
</body>
</html>`;
  }

  private generateLetterContent(siteSettings: SiteSettings): string {
    // استخدام النص المخصص إذا كان موجوداً، وإلا استخدام النص الافتراضي
    if (
      siteSettings.acceptance_letter_content &&
      siteSettings.acceptance_letter_content.trim()
    ) {
      // تحويل النص إلى فقرات HTML
      const paragraphs = siteSettings.acceptance_letter_content
        .split('\n')
        .filter((p) => p.trim())
        .map((p) => `<p>${p.trim()}</p>`)
        .join('\n            ');
      return paragraphs;
    }

    // النص الافتراضي
    return `
            <p>قد تم قبوله للنشر في مجلتنا بعد مراجعته من قبل المحكمين المختصين واستيفائه لجميع المعايير العلمية والأكاديمية المطلوبة.</p>
            
            <p>نتقدم لكم بأحر التهاني على هذا الإنجاز العلمي المتميز، ونتطلع إلى المزيد من التعاون العلمي المثمر معكم.</p>
            
            <p>وتفضلوا بقبول فائق الاحترام والتقدير،</p>`;
  }

  private generateContactInfo(siteSettings: SiteSettings): string {
    const contactParts = [];

    if (siteSettings.contact_info?.phone) {
      // تنسيق رقم الهاتف بشكل صحيح (من اليسار لليمين)
      const phoneNumber = siteSettings.contact_info.phone;
      contactParts.push(
        `<span>الهاتف: <span dir="ltr" style="display: inline-block;">${phoneNumber}</span></span>`
      );
    }

    if (siteSettings.contact_info?.email) {
      contactParts.push(
        `<span>البريد الإلكتروني: ${siteSettings.contact_info.email}</span>`
      );
    }

    if (siteSettings.university_url) {
      contactParts.push(
        `<a href="${siteSettings.university_url}" target="_blank" style="color: #b2823e; text-decoration: underline; font-weight: 600;">موقع الجامعة</a>`
      );
    }

    if (siteSettings.contact_info?.website) {
      contactParts.push(
        `<span>الموقع الإلكتروني: ${siteSettings.contact_info.website}</span>`
      );
    }

    return contactParts.join(' <span class="footer-separator">|</span> ');
  }

  /**
   * Generate an acceptance certificate PDF for a research paper
   */
  async generateAcceptanceCertificate(
    research: Research,
    researcher: User,
    siteSettings: SiteSettings
  ): Promise<Buffer> {
    let browser;

    try {
      browser = await this.createBrowser();
      const page = await browser.newPage();

      // تحديد حجم الصفحة
      await page.setViewport({ width: 794, height: 1123 }); // A4 size in pixels

      // تحميل الشعارات
      const logoBase64 = await this.getLogoBase64();
      const journalLogoBase64 = await this.getJournalLogoBase64();

      // تحميل المحتوى HTML
      const htmlContent = this.generateAcceptanceLetterHTML(
        research,
        researcher,
        siteSettings,
        logoBase64,
        journalLogoBase64
      );
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // تحويل إلى PDF - صفحة واحدة فقط
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          right: '0',
          bottom: '0',
          left: '0',
        },
        preferCSSPageSize: true,
        pageRanges: '1',
      });

      await page.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate a simple research acceptance letter
   */
  async generateAcceptanceLetter(
    research: Research,
    researcher: User,
    siteSettings: SiteSettings
  ): Promise<Buffer> {
    // استخدم نفس الدالة لأن التصميم أصبح موحد
    return this.generateAcceptanceCertificate(
      research,
      researcher,
      siteSettings
    );
  }
}
