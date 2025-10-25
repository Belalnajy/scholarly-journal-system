# إصلاح مشكلة عرض ملفات PDF من Cloudinary

## المشاكل

### 1. خطأ HTTP 401 (غير مصرح)
عند محاولة فتح رابط PDF من Cloudinary، كان يظهر خطأ HTTP 401.

**السبب:** الملفات كانت يتم رفعها بنوع `type: 'authenticated'` مما يجعلها خاصة وتحتاج توقيع للوصول إليها.

### 2. أسماء الملفات بالعربي في URL
الرابط كان يحتوي على أحرف عربية مشفرة:
```
https://res.cloudinary.com/dxcgmdbbs/raw/upload/v1761223239/research/pdfs/RES-2025-3665/%C3%99%C2%85%C3%99%C2%88%C3%99%C2%82%C3%98%C2%B9%20%C3%98%C2%A7%C3%99%C2%84%C3%98%C2%B4%C3%98%C2%AD%C3%99%C2%86%C3%98%C2%A7%C3%98%C2%AA.pdf
```

**السبب:** Cloudinary لا يدعم الأحرف العربية في أسماء الملفات بشكل جيد.

## الحل

### 1. تغيير نوع الرفع في CloudinaryService
**الملف:** `apps/backend/src/modules/cloudinary/cloudinary.service.ts`

تم تغيير السطر 45 من:
```typescript
type: 'authenticated', // Upload as authenticated to bypass delivery restrictions
```

إلى:
```typescript
type: 'upload', // Upload as public for direct access
```

### 2. تحديث دالة getDownloadUrl
تم تبسيط دالة `getDownloadUrl` لاستخدام URL عادي بدلاً من `private_download_url`:

```typescript
getDownloadUrl(publicId: string, fileName: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
    flags: 'attachment',
  });
}
```

### 3. إضافة دالة sanitizeFileName
تم إضافة دالة لتنظيف أسماء الملفات من الأحرف العربية والخاصة:

```typescript
private sanitizeFileName(fileName: string): string {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  
  // Replace Arabic and special characters with underscores
  // Keep only: a-z, A-Z, 0-9, hyphen, underscore
  const sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  
  return sanitized || 'file';
}
```

### 4. تحديث uploadResearchPDF
تم تغيير اسم الملف ليستخدم رقم البحث بدلاً من الاسم الأصلي:

```typescript
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
      type: 'upload',
      resource_type: 'raw',
    }
  );
}
```

**النتيجة:** الرابط الآن سيكون:
```
https://res.cloudinary.com/dxcgmdbbs/raw/upload/v1761223239/research/pdfs/RES-2025-3665/RES-2025-3665.pdf
```

### 5. تحديث uploadSupplementaryFile
تم استخدام `sanitizeFileName` مع timestamp للملفات الإضافية:

```typescript
async uploadSupplementaryFile(
  fileBuffer: Buffer,
  researchNumber: string,
  fileName: string
): Promise<CloudinaryUploadResult> {
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
```

### 6. إضافة endpoint جديد للعرض
تم إضافة endpoint جديد للحصول على URL للعرض (بدون إجبار التحميل):

**Backend Service:** `apps/backend/src/modules/research/research.service.ts`
```typescript
async getResearchPdfViewUrl(research_id: string): Promise<string> {
  const research = await this.findOne(research_id);
  
  if (!research.cloudinary_public_id) {
    if (research.file_url) {
      return research.file_url;
    }
    throw new NotFoundException('لا يوجد ملف PDF لهذا البحث');
  }
  
  return this.cloudinaryService.getFileUrl(
    research.cloudinary_public_id,
    'raw'
  );
}
```

**Backend Controller:** `apps/backend/src/modules/research/research.controller.ts`
```typescript
@Get(':id/pdf-view-url')
getResearchPdfViewUrl(@Param('id') research_id: string) {
  return this.researchService.getResearchPdfViewUrl(research_id);
}
```

**Frontend Service:** `apps/frontend/src/services/researchService.ts`
```typescript
async getResearchPdfViewUrl(research_id: string): Promise<string> {
  try {
    const response = await api.get<string>(
      `/research/${research_id}/pdf-view-url`
    );
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
```

## الفرق بين الـ Endpoints

### 1. `/api/research/:id/pdf-view-url`
- يعطي URL للعرض المباشر في المتصفح
- لا يجبر التحميل
- مناسب لعرض PDF في iframe أو نافذة جديدة

### 2. `/api/research/:id/pdf-download-url`
- يعطي URL مع flag للتحميل
- يجبر المتصفح على تحميل الملف
- مناسب لزر "تحميل"

## الخطوات التالية

### 1. إعادة تشغيل Backend
```bash
cd apps/backend
npm run dev
```

### 2. إعادة رفع الملفات القديمة (اختياري)
الملفات المرفوعة سابقاً بنوع `authenticated` ستظل تحتاج توقيع. لإصلاحها:

**الخيار 1:** إعادة رفع الملفات
- احذف الملف القديم من Cloudinary
- ارفع الملف مرة أخرى (سيستخدم النوع الجديد `upload`)

**الخيار 2:** تغيير نوع الملفات الموجودة في Cloudinary Dashboard
- اذهب إلى Cloudinary Dashboard
- اختر الملفات
- غير `Access Control` من `Authenticated` إلى `Public`

### 3. استخدام الـ API الجديد في Frontend
```typescript
// للعرض في المتصفح
const viewUrl = await researchService.getResearchPdfViewUrl(researchId);
window.open(viewUrl, '_blank');

// للتحميل
const downloadUrl = await researchService.getResearchPdfDownloadUrl(researchId);
window.location.href = downloadUrl;
```

## ملاحظات مهمة

1. **الملفات الجديدة:** جميع الملفات المرفوعة من الآن ستكون عامة ويمكن الوصول إليها مباشرة
2. **الأمان:** إذا كنت تريد حماية الملفات، يمكنك:
   - إضافة middleware للتحقق من صلاحيات المستخدم قبل إعطاء الرابط
   - استخدام signed URLs مع وقت انتهاء
   - استخدام Cloudinary's access control features

3. **التخزين المؤقت:** Cloudinary يقوم بـ cache للملفات تلقائياً لتحسين الأداء

## اختبار الحل

1. ارفع ملف PDF جديد
2. احصل على الرابط من `cloudinary_secure_url`
3. افتح الرابط في المتصفح - يجب أن يعمل مباشرة
4. جرب استخدام `getResearchPdfViewUrl` للحصول على رابط العرض

## الملفات المعدلة

- ✅ `apps/backend/src/modules/cloudinary/cloudinary.service.ts`
- ✅ `apps/backend/src/modules/research/research.service.ts`
- ✅ `apps/backend/src/modules/research/research.controller.ts`
- ✅ `apps/frontend/src/services/researchService.ts`
