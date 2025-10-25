# Cloudinary Integration Guide

## Overview
تم تهيئة Cloudinary لحفظ وإدارة الملفات (الصور، PDF، وملفات أخرى) في التطبيق.

## Configuration

### Environment Variables
تم إضافة متغير البيئة التالي في ملف `.env`:

```env
CLOUDINARY_URL=cloudinary://239981419569485:SAI_t-S1JekbLOOtOcuoVdUnXrI@dxcgmdbbs
```

## Database Schema Changes

تم إضافة الحقول التالية للجداول:

### Research Table
- `cloudinary_public_id`: معرف الملف في Cloudinary
- `cloudinary_secure_url`: رابط آمن للملف

### Research Files Table
- `cloudinary_public_id`: معرف الملف في Cloudinary
- `cloudinary_secure_url`: رابط آمن للملف
- `cloudinary_format`: صيغة الملف (pdf, jpg, png, etc.)
- `cloudinary_resource_type`: نوع المورد (image, raw, video)

### Users Table
- `avatar_cloudinary_public_id`: معرف صورة المستخدم في Cloudinary
- `avatar_cloudinary_secure_url`: رابط آمن لصورة المستخدم

## API Endpoints

### Upload Research PDF
```http
POST /api/research/:id/upload-pdf
Content-Type: multipart/form-data

Body:
- file: PDF file
```

**Response:**
```json
{
  "id": "uuid",
  "file_url": "https://res.cloudinary.com/...",
  "cloudinary_public_id": "research/pdfs/RES-2024-001/filename",
  "cloudinary_secure_url": "https://res.cloudinary.com/..."
}
```

### Upload Supplementary File
```http
POST /api/research/:id/upload-supplementary
Content-Type: multipart/form-data

Body:
- file: Any file
- category: "supplementary" | "revision"
```

**Response:**
```json
{
  "id": "uuid",
  "file_name": "document.pdf",
  "file_url": "https://res.cloudinary.com/...",
  "cloudinary_public_id": "research/supplementary/RES-2024-001/document",
  "cloudinary_format": "pdf",
  "cloudinary_resource_type": "raw"
}
```

### Get File Download URL
```http
GET /api/research/files/:file_id/download-url
```

**Response:**
```json
{
  "download_url": "https://res.cloudinary.com/...?attachment=filename.pdf"
}
```

### Get PDF Thumbnail
```http
GET /api/research/:id/pdf-thumbnail?page=1
```

**Response:**
```json
{
  "thumbnail_url": "https://res.cloudinary.com/.../image/upload/pg_1/..."
}
```

## Cloudinary Service Methods

### Upload Methods

#### `uploadFile(fileBuffer, folder, resourceType, options)`
رفع ملف عام إلى Cloudinary

**Parameters:**
- `fileBuffer`: Buffer - محتوى الملف
- `folder`: string - مسار المجلد في Cloudinary
- `resourceType`: 'image' | 'raw' | 'video' | 'auto' - نوع المورد
- `options`: object - خيارات إضافية

#### `uploadResearchPDF(fileBuffer, researchNumber, fileName)`
رفع ملف PDF خاص بالبحث

#### `uploadSupplementaryFile(fileBuffer, researchNumber, fileName)`
رفع ملف إضافي للبحث

#### `uploadAvatar(fileBuffer, userId)`
رفع صورة شخصية للمستخدم

### Delete Methods

#### `deleteFile(publicId, resourceType)`
حذف ملف من Cloudinary

### URL Generation Methods

#### `getFileUrl(publicId, resourceType)`
الحصول على رابط الملف

#### `getDownloadUrl(publicId, fileName)`
الحصول على رابط تحميل الملف

#### `getOptimizedImageUrl(publicId, width, height, quality)`
الحصول على رابط صورة محسنة

#### `getPdfThumbnail(publicId, page)`
الحصول على صورة مصغرة لصفحة من PDF

## File Organization in Cloudinary

```
my-journal/
├── research/
│   ├── pdfs/
│   │   └── RES-2024-001/
│   │       └── research-paper.pdf
│   └── supplementary/
│       └── RES-2024-001/
│           ├── data.xlsx
│           └── figures.zip
└── users/
    └── avatars/
        └── avatar_user-uuid.jpg
```

## Migration

لتطبيق التغييرات على قاعدة البيانات، قم بتشغيل:

```bash
npm run typeorm migration:run
```

## Usage Examples

### في Research Service

```typescript
// رفع PDF للبحث
const research = await this.researchService.uploadResearchPDF(
  research_id,
  fileBuffer,
  'research-paper.pdf',
  fileSize
);

// رفع ملف إضافي
const file = await this.researchService.uploadSupplementaryFile(
  research_id,
  fileBuffer,
  'data.xlsx',
  fileSize,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'supplementary'
);

// الحصول على رابط التحميل
const downloadUrl = await this.researchService.getFileDownloadUrl(file_id);

// الحصول على صورة مصغرة للـ PDF
const thumbnail = await this.researchService.getPdfThumbnail(research_id, 1);
```

### في Frontend

```typescript
// رفع ملف
const formData = new FormData();
formData.append('file', file);

const response = await fetch(`/api/research/${researchId}/upload-pdf`, {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('File uploaded:', result.cloudinary_secure_url);
```

## Features

### ✅ Automatic File Optimization
- الصور يتم ضغطها وتحسينها تلقائياً
- دعم صيغ الصور الحديثة (WebP, AVIF)

### ✅ Secure URLs
- جميع الروابط تستخدم HTTPS
- إمكانية إنشاء روابط مؤقتة

### ✅ PDF Support
- رفع ملفات PDF
- إنشاء صور مصغرة للصفحات
- روابط تحميل مباشرة

### ✅ File Management
- حذف الملفات تلقائياً عند حذف السجل
- تنظيم الملفات في مجلدات
- تتبع معلومات الملف (الحجم، النوع، التاريخ)

### ✅ Image Transformations
- تغيير الحجم
- القص والتحسين
- إضافة تأثيرات

## Security Notes

⚠️ **Important:**
- لا تشارك `CLOUDINARY_URL` مع أي شخص
- استخدم متغيرات البيئة فقط
- لا تضع المعلومات الحساسة في الكود

## Troubleshooting

### خطأ: "CLOUDINARY_URL is not defined"
تأكد من وجود ملف `.env` وأن المتغير محدد بشكل صحيح.

### خطأ: "Failed to upload file"
تحقق من:
- اتصال الإنترنت
- صحة بيانات Cloudinary
- حجم الملف (الحد الأقصى حسب خطة Cloudinary)

### خطأ: "File not found"
تأكد من أن `public_id` صحيح ولم يتم حذف الملف من Cloudinary.

## Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK Guide](https://cloudinary.com/documentation/node_integration)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
