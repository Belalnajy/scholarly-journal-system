# إصلاح مشكلة تحميل شهادات القبول من Cloudinary

## المشكلة
عند محاولة تحميل شهادة القبول، كان يظهر خطأ 404:
```
GET https://res.cloudinary.com/.../authenticated/...pdf 404 (Not Found)
```

## السبب
كانت الشهادات تُرفع كملفات عامة (public) لكن الرابط المُولد كان يستخدم `authenticated` URL.

## الحل المطبق

### 1. تحديث طريقة الرفع
```typescript
// قبل:
await this.cloudinaryService.uploadFile(
  pdfBuffer,
  `certificates/${research.research_number}_acceptance_certificate.pdf`,
  'raw'
);

// بعد:
await this.cloudinaryService.uploadFile(
  pdfBuffer,
  `certificates`,
  'raw',
  {
    public_id: `${research.research_number}_acceptance_certificate`,
    format: 'pdf',
    access_mode: 'public',
    type: 'upload', // Public upload
  }
);
```

### 2. تحديث طريقة الحصول على الرابط
```typescript
// قبل:
return this.cloudinaryService.getAuthenticatedFileUrl(
  research.acceptance_certificate_cloudinary_public_id,
  'raw',
  3600
);

// بعد:
// Return direct secure URL (public file)
if (research.acceptance_certificate_cloudinary_secure_url) {
  return research.acceptance_certificate_cloudinary_secure_url;
}

// Fallback
return this.cloudinaryService.getDownloadUrl(
  research.acceptance_certificate_cloudinary_public_id,
  `${research.research_number}_acceptance_certificate.pdf`
);
```

## الفوائد

1. ✅ **روابط مباشرة**: لا حاجة لتوليد signed URLs
2. ✅ **أسرع**: التحميل فوري بدون طلبات إضافية
3. ✅ **أبسط**: كود أقل تعقيداً
4. ✅ **موثوق**: لا مشاكل مع انتهاء صلاحية الروابط

## ملاحظة مهمة

الشهادات القديمة (المُولدة قبل هذا الإصلاح) قد تحتاج إعادة توليد:

### للشهادات القديمة:
1. اذهب إلى "إدارة الأبحاث"
2. استخدم endpoint إعادة التوليد:
```bash
POST /api/research/{id}/regenerate-acceptance-certificate
```

أو من console المتصفح:
```javascript
// إعادة توليد شهادة واحدة
await researchService.regenerateAcceptanceCertificate('research-id');

// إعادة توليد جميع الشهادات
const researches = await researchService.getAll({ status: 'accepted' });
for (const research of researches) {
  if (research.acceptance_certificate_cloudinary_public_id) {
    await researchService.regenerateAcceptanceCertificate(research.id);
    await new Promise(r => setTimeout(r, 1000)); // انتظر ثانية
  }
}
```

## الاختبار

### 1. توليد شهادة جديدة
```bash
# قبول بحث جديد
PATCH /api/research/{id}/status
Body: { "status": "accepted" }

# التحقق من توليد الشهادة
GET /api/research/{id}
# تحقق من وجود: acceptance_certificate_cloudinary_secure_url
```

### 2. تحميل الشهادة
```bash
# الحصول على رابط التحميل
GET /api/research/{id}/acceptance-certificate-url

# يجب أن يُرجع رابط مثل:
https://res.cloudinary.com/dxcgmdbbs/raw/upload/v1/certificates/RES-2025-1234_acceptance_certificate.pdf
```

### 3. التحقق من التحميل
- افتح الرابط في المتصفح
- يجب أن يُحمل الملف مباشرة
- لا أخطاء 404

## الملفات المعدلة

1. ✅ `research.service.ts`
   - `generateAcceptanceCertificate()` - تحديث طريقة الرفع
   - `getAcceptanceCertificateUrl()` - استخدام الرابط المباشر

## الخطوات التالية

### للأبحاث الجديدة:
- ✅ تعمل تلقائياً بدون مشاكل

### للأبحاث القديمة:
1. إعادة توليد الشهادات (اختياري)
2. أو: تحديث الروابط في قاعدة البيانات

## الدعم
للمساعدة أو الإبلاغ عن مشاكل، تواصل مع فريق التطوير.
