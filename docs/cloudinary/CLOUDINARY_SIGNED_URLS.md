# Cloudinary Signed URLs - الحل الشامل

## المشكلة
الملفات المرفوعة سابقاً بنوع `type: 'authenticated'` لا يمكن الوصول إليها مباشرة وتظهر خطأ HTTP 401.

## الحل النهائي

تم إضافة دعم **Signed URLs** للملفات الـ authenticated مع الحفاظ على دعم الملفات العامة الجديدة.

---

## 1. Backend Implementation

### CloudinaryService - دالة جديدة

```typescript
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
```

### ResearchService - تحديث الدوال

#### getResearchPdfDownloadUrl
```typescript
async getResearchPdfDownloadUrl(research_id: string): Promise<string> {
  const research = await this.findOne(research_id);

  if (!research.cloudinary_public_id) {
    if (research.file_url) {
      return research.file_url;
    }
    throw new NotFoundException('لا يوجد ملف PDF لهذا البحث');
  }

  // Generate authenticated signed URL (works for old authenticated files)
  try {
    return this.cloudinaryService.getAuthenticatedFileUrl(
      research.cloudinary_public_id,
      'raw',
      3600 // 1 hour
    );
  } catch (error) {
    // Fallback to regular download URL for public files
    const fileName = `${research.research_number}.pdf`;
    return this.cloudinaryService.getDownloadUrl(
      research.cloudinary_public_id,
      fileName
    );
  }
}
```

#### getResearchPdfViewUrl
```typescript
async getResearchPdfViewUrl(research_id: string): Promise<string> {
  const research = await this.findOne(research_id);

  if (!research.cloudinary_public_id) {
    if (research.file_url) {
      return research.file_url;
    }
    throw new NotFoundException('لا يوجد ملف PDF لهذا البحث');
  }

  // Generate authenticated signed URL for viewing
  return this.cloudinaryService.getAuthenticatedFileUrl(
    research.cloudinary_public_id,
    'raw',
    3600 // 1 hour
  );
}
```

### ResearchController - Endpoint عام

```typescript
@Get('download')
async getSignedDownloadUrl(@Query('file') publicId: string) {
  if (!publicId) {
    return { error: 'Missing file parameter' };
  }

  try {
    const { CloudinaryService } = await import('../cloudinary/cloudinary.service');
    const cloudinaryService = new CloudinaryService();
    
    const url = cloudinaryService.getAuthenticatedFileUrl(publicId, 'raw', 3600);
    
    return { url };
  } catch (error) {
    return { 
      error: 'Failed to generate signed URL',
      message: error.message 
    };
  }
}
```

---

## 2. API Endpoints

### للحصول على Signed URL لملف معين

**Endpoint:**
```
GET /api/research/download?file=research/pdfs/RES-2025-0881/RES-2025-0881
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/dxcgmdbbs/raw/authenticated/s--SIGNATURE--/v1761223304/research/pdfs/RES-2025-0881/RES-2025-0881.pdf"
}
```

### للحصول على رابط عرض PDF

**Endpoint:**
```
GET /api/research/:id/pdf-view-url
```

**Response:**
```
https://res.cloudinary.com/dxcgmdbbs/raw/authenticated/s--SIGNATURE--/v1761223304/research/pdfs/RES-2025-0881/RES-2025-0881.pdf
```

### للحصول على رابط تحميل PDF

**Endpoint:**
```
GET /api/research/:id/pdf-download-url
```

**Response:**
```
https://res.cloudinary.com/dxcgmdbbs/raw/authenticated/s--SIGNATURE--/v1761223304/research/pdfs/RES-2025-0881/RES-2025-0881.pdf
```

---

## 3. كيف يعمل Signed URL

### مكونات الرابط الموقع:

```
https://res.cloudinary.com/[CLOUD_NAME]/[RESOURCE_TYPE]/[TYPE]/s--[SIGNATURE]--/v[VERSION]/[PUBLIC_ID]
```

**مثال:**
```
https://res.cloudinary.com/dxcgmdbbs/raw/authenticated/s--AbC123XyZ--/v1761223304/research/pdfs/RES-2025-0881/RES-2025-0881.pdf
```

### المكونات:
- `raw` - نوع المورد (للـ PDF)
- `authenticated` - نوع الوصول
- `s--AbC123XyZ--` - التوقيع الأمني
- `v1761223304` - رقم الإصدار
- `research/pdfs/...` - المسار الكامل للملف

### الأمان:
- ✅ التوقيع يتم توليده باستخدام API Secret
- ✅ الرابط صالح لمدة ساعة واحدة فقط
- ✅ لا يمكن تزوير التوقيع بدون API Secret
- ✅ بعد انتهاء المدة، الرابط يصبح غير صالح

---

## 4. Frontend Integration

### استخدام في React/TypeScript

```typescript
// في researchService.ts
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

// استخدام عام لأي ملف
async getSignedUrl(publicId: string): Promise<string> {
  try {
    const response = await api.get<{ url: string }>(
      `/research/download`,
      { params: { file: publicId } }
    );
    return response.data.url;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
```

### مثال استخدام في Component

```typescript
const ViewPdfButton = ({ researchId }: { researchId: string }) => {
  const [loading, setLoading] = useState(false);

  const handleViewPdf = async () => {
    setLoading(true);
    try {
      const url = await researchService.getResearchPdfViewUrl(researchId);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to get PDF URL:', error);
      alert('فشل في فتح الملف');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleViewPdf} disabled={loading}>
      {loading ? 'جاري التحميل...' : 'عرض PDF'}
    </button>
  );
};
```

---

## 5. الفرق بين الملفات القديمة والجديدة

### الملفات القديمة (authenticated)
- ✅ تعمل الآن مع Signed URLs
- ⏱️ الرابط صالح لمدة ساعة
- 🔒 محمية بتوقيع أمني

**مثال:**
```
https://res.cloudinary.com/dxcgmdbbs/raw/authenticated/s--SIGNATURE--/v1761223304/research/pdfs/RES-2025-0881/RES-2025-0881.pdf
```

### الملفات الجديدة (upload/public)
- ✅ يمكن الوصول إليها مباشرة
- ♾️ الرابط دائم
- 🌐 عام للجميع

**مثال:**
```
https://res.cloudinary.com/dxcgmdbbs/raw/upload/v1761223304/research/pdfs/RES-2025-1234/RES-2025-1234.pdf
```

---

## 6. اختبار الحل

### اختبار من Terminal

```bash
# احصل على signed URL
curl "http://localhost:3000/api/research/download?file=research/pdfs/RES-2025-0881/RES-2025-0881"

# النتيجة
{
  "url": "https://res.cloudinary.com/dxcgmdbbs/raw/authenticated/s--AbC123--/v1761223304/research/pdfs/RES-2025-0881/RES-2025-0881.pdf"
}

# افتح الرابط في المتصفح
# يجب أن يعمل بدون خطأ 401
```

### اختبار من Frontend

```typescript
// في Console
const url = await researchService.getResearchPdfViewUrl('research-id-here');
console.log(url);
window.open(url, '_blank');
```

---

## 7. ملاحظات مهمة

### الأمان
- ⚠️ لا تشارك API Secret أبداً
- ✅ Signed URLs آمنة للمشاركة (لمدة محدودة)
- ✅ يمكن إضافة middleware للتحقق من صلاحيات المستخدم قبل إعطاء الرابط

### الأداء
- ✅ توليد Signed URL سريع جداً (milliseconds)
- ✅ Cloudinary يقوم بـ cache للملفات
- ✅ CDN عالمي لسرعة التحميل

### الصلاحية
- ⏱️ الرابط صالح لمدة ساعة (3600 ثانية)
- 🔄 يمكن تغيير المدة عبر parameter `expiresInSeconds`
- ♻️ بعد انتهاء المدة، يمكن طلب رابط جديد

---

## 8. الخلاصة

### ما تم إنجازه:
✅ دعم Signed URLs للملفات الـ authenticated القديمة
✅ دعم الملفات العامة الجديدة
✅ Endpoint عام للحصول على signed URL لأي ملف
✅ تنظيف أسماء الملفات من الأحرف العربية
✅ توثيق شامل

### الآن يمكنك:
- ✅ فتح الملفات القديمة بدون خطأ 401
- ✅ رفع ملفات جديدة بأسماء نظيفة
- ✅ الحصول على روابط موقعة لأي ملف
- ✅ التحكم في مدة صلاحية الروابط

### الملفات المعدلة:
- `apps/backend/src/modules/cloudinary/cloudinary.service.ts`
- `apps/backend/src/modules/research/research.service.ts`
- `apps/backend/src/modules/research/research.controller.ts`
- `apps/frontend/src/services/researchService.ts`

---

## 9. استخدام سريع

```bash
# 1. أعد تشغيل Backend (إذا لم يكن يعمل)
npx nx serve backend

# 2. اختبر الـ API
curl "http://localhost:3000/api/research/download?file=research/pdfs/RES-2025-0881/RES-2025-0881"

# 3. استخدم الرابط المُرجع في المتصفح
# يجب أن يعمل بدون مشاكل! 🎉
```
