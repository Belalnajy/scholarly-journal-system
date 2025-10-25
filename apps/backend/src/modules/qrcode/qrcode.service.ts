import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class QRCodeService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Generate QR Code as Data URL (base64)
   */
  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`فشل في توليد رمز QR: ${error.message}`);
    }
  }

  /**
   * Generate QR Code and upload to Cloudinary
   */
  async generateAndUploadQRCode(
    data: string,
    folder: string,
    publicId: string,
  ): Promise<{ url: string; publicId: string }> {
    try {
      // Generate QR Code as base64
      const qrCodeDataURL = await this.generateQRCode(data);

      // Upload to Cloudinary
      const result = await this.cloudinaryService.uploadBase64Image(
        qrCodeDataURL,
        folder,
        publicId,
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      throw new Error(`فشل في رفع رمز QR: ${error.message}`);
    }
  }

  /**
   * Generate verification URL for article
   */
  generateArticleVerificationUrl(
    articleId: string,
    baseUrl: string = process.env.FRONTEND_URL || 'http://localhost:4200',
  ): string {
    return `${baseUrl}/verify-article/${articleId}`;
  }

  /**
   * Generate verification URL using DOI
   */
  generateArticleVerificationUrlByDOI(
    doi: string,
    baseUrl: string = process.env.FRONTEND_URL || 'http://localhost:4200',
  ): string {
    return `${baseUrl}/verify-article/doi/${encodeURIComponent(doi)}`;
  }

  /**
   * Delete QR Code from Cloudinary
   */
  async deleteQRCode(publicId: string): Promise<void> {
    try {
      await this.cloudinaryService.deleteFile(publicId);
    } catch (error) {
      console.error(`فشل في حذف رمز QR: ${error.message}`);
    }
  }
}
