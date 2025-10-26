import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
}

@Injectable()
export class CloudinaryService {
  constructor() {
    // Initialize Cloudinary with environment variable
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    if (!cloudinaryUrl) {
      throw new Error('CLOUDINARY_URL is not defined in environment variables');
    }

    // Parse CLOUDINARY_URL: cloudinary://api_key:api_secret@cloud_name
    try {
      const url = new URL(cloudinaryUrl);
      const cloudName = url.hostname;
      const apiKey = url.username;
      const apiSecret = url.password;

      if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
      }

      // Configure Cloudinary with parsed credentials
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });

      console.log('✅ Cloudinary configured successfully:', cloudName);
    } catch (error) {
      throw new Error(`Failed to configure Cloudinary: ${error.message}`);
    }
  }

  /**
   * Sanitize filename by removing Arabic characters and special chars
   * Replace with safe alternatives
   */
  private sanitizeFileName(fileName: string): string {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    
    // Replace Arabic and special characters with underscores
    // Keep only: a-z, A-Z, 0-9, hyphen, underscore
    const sanitized = nameWithoutExt
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
    return sanitized || 'file';
  }

  /**
   * Upload file buffer to Cloudinary
   * @param fileBuffer - File buffer to upload
   * @param folder - Cloudinary folder path
   * @param resourceType - Type of resource (image, raw, video, auto)
   * @param options - Additional upload options
   */
  async uploadFile(
    fileBuffer: Buffer,
    folder: string,
    resourceType: 'image' | 'raw' | 'video' | 'auto' = 'auto',
    options: Record<string, any> = {}
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          ...options,
          folder,
          resource_type: resourceType,
          type: options.type || 'upload', // Default to 'upload' (public) unless specified
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new BadRequestException(`Failed to upload file: ${error.message}`));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
              created_at: result.created_at,
            });
          }
        }
      );

      const readableStream = Readable.from(fileBuffer);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Upload research PDF file
   */
  async uploadResearchPDF(
    fileBuffer: Buffer,
    researchNumber: string,
    fileName: string
  ): Promise<CloudinaryUploadResult> {
    // Use research number as filename to avoid Arabic characters in URL
    const sanitizedFileName = researchNumber;
    
    return this.uploadFile(
      fileBuffer,
      `research/pdfs/${researchNumber}`,
      'raw',
      {
        public_id: sanitizedFileName,
        format: 'pdf',
        access_mode: 'public', // Force public access
        // type will default to 'upload' (public) from uploadFile
      }
    );
  }

  /**
   * Upload supplementary research file
   */
  async uploadSupplementaryFile(
    fileBuffer: Buffer,
    researchNumber: string,
    fileName: string
  ): Promise<CloudinaryUploadResult> {
    // Sanitize filename to remove Arabic characters
    const sanitizedFileName = this.sanitizeFileName(fileName);
    const timestamp = Date.now();
    const uniqueFileName = `${sanitizedFileName}_${timestamp}`;
    
    return this.uploadFile(
      fileBuffer,
      `research/supplementary/${researchNumber}`,
      'auto',
      {
        public_id: uniqueFileName,
        access_mode: 'public',
      }
    );
  }

  /**
   * Upload user avatar image
   */
  async uploadAvatar(
    fileBuffer: Buffer,
    userId: string
  ): Promise<CloudinaryUploadResult> {
    return this.uploadFile(
      fileBuffer,
      'users/avatars',
      'image',
      {
        public_id: `avatar_${userId}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
        overwrite: true,
      }
    );
  }

  /**
   * Delete file from Cloudinary
   * @param publicId - The public ID of the file to delete
   * @param resourceType - Type of resource
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'raw'
  ): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      throw new BadRequestException(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get file URL from public ID
   */
  getFileUrl(publicId: string, resourceType: 'image' | 'raw' | 'video' = 'raw'): string {
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      secure: true,
    });
  }

  /**
   * Generate presigned URL for authenticated files
   * Returns a signed URL that is valid for 1 hour
   * This works with files that have type: 'authenticated'
   */
  getAuthenticatedFileUrl(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'raw',
    expiresInSeconds: number = 3600
  ): string {
    const timestamp = Math.round(Date.now() / 1000) + expiresInSeconds;
    
    return cloudinary.url(publicId, {
      resource_type: resourceType,
      type: 'authenticated',
      secure: true,
      sign_url: true,
      expires_at: timestamp,
    });
  }

  /**
   * Generate download URL for a file
   * Returns a public URL with attachment flag to force download
   */
  getDownloadUrl(publicId: string, fileName: string): string {
    // Generate a public URL with attachment flag to force download
    return cloudinary.url(publicId, {
      resource_type: 'raw',
      secure: true,
      flags: 'attachment',
      // Optionally add custom filename
      // Note: Cloudinary uses the public_id as filename by default
    });
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    publicId: string,
    width?: number,
    height?: number,
    quality: string = 'auto'
  ): string {
    return cloudinary.url(publicId, {
      resource_type: 'image',
      secure: true,
      transformation: [
        { width, height, crop: 'limit' },
        { quality, fetch_format: 'auto' },
      ],
    });
  }

  /**
   * Get thumbnail URL for PDF
   */
  getPdfThumbnail(publicId: string, page: number = 1): string {
    return cloudinary.url(publicId, {
      resource_type: 'image',
      secure: true,
      format: 'jpg',
      page,
      transformation: [
        { width: 300, crop: 'scale' },
        { quality: 'auto' },
      ],
    });
  }

  /**
   * Upload base64 image (for QR codes)
   */
  async uploadBase64Image(
    base64Data: string,
    folder: string,
    publicId: string,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Data,
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          type: 'upload',
          access_mode: 'public',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new BadRequestException(`Failed to upload base64 image: ${error.message}`));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
              created_at: result.created_at,
            });
          }
        }
      );
    });
  }
}
