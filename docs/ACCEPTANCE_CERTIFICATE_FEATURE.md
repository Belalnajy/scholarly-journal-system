# ميزة شهادة قبول البحث (Acceptance Certificate)

## نظرة عامة
تم إضافة نظام كامل لتوليد وتحميل شهادات قبول الأبحاث بصيغة PDF بتصميم احترافي يحمل هوية المجلة.

## المميزات

### 1. توليد تلقائي للشهادة
- يتم توليد شهادة القبول تلقائياً عند تغيير حالة البحث إلى "مقبول" (accepted)
- الشهادة تُرفع تلقائياً على Cloudinary
- تحتوي على:
  - شعار وهوية المجلة
  - عنوان البحث
  - رقم البحث
  - اسم الباحث
  - تاريخ القبول
  - توقيع رئيس التحرير
  - ختم المجلة
  - معلومات التواصل

### 2. تصميم احترافي
- تصميم مستوحى من الصورة المرفقة
- شريط أخضر علوي بشعار المجلة
- إطار زخرفي للمحتوى
- علامة مائية "مقبول" في الخلفية
- ألوان متناسقة مع هوية المجلة

### 3. إتاحة التحميل للباحث
- زر تحميل مميز في صفحة عرض البحث
- يظهر فقط للأبحاث المقبولة أو المنشورة
- تحميل مباشر بصيغة PDF

## التنفيذ التقني

### Backend

#### 1. PDF Generator Service
**الملف:** `apps/backend/src/modules/pdf/pdf-generator.service.ts`

```typescript
// توليد شهادة القبول
generateAcceptanceCertificate(research, researcher, siteSettings)
```

**المميزات:**
- استخدام مكتبة `pdfkit` لتوليد PDF
- تصميم احترافي مع دعم اللغة العربية
- إمكانية التخصيص حسب إعدادات الموقع

#### 2. Research Entity
**الملف:** `apps/backend/src/database/entities/research.entity.ts`

**حقول جديدة:**
```typescript
acceptance_certificate_url: string
acceptance_certificate_cloudinary_public_id: string
acceptance_certificate_cloudinary_secure_url: string
```

#### 3. Research Service
**الملف:** `apps/backend/src/modules/research/research.service.ts`

**دوال جديدة:**
- `generateAcceptanceCertificate(research_id)` - توليد الشهادة
- `getAcceptanceCertificateUrl(research_id)` - الحصول على رابط التحميل
- `regenerateAcceptanceCertificate(research_id)` - إعادة توليد الشهادة

#### 4. API Endpoints
**الملف:** `apps/backend/src/modules/research/research.controller.ts`

```
GET    /api/research/:id/acceptance-certificate-url
POST   /api/research/:id/generate-acceptance-certificate
POST   /api/research/:id/regenerate-acceptance-certificate
```

**الصلاحيات:**
- `GET` - متاح للباحث والأدمن والمحرر
- `POST` - متاح للأدمن والمحرر فقط

### Frontend

#### 1. Research Service
**الملف:** `apps/frontend/src/services/researchService.ts`

**دوال جديدة:**
```typescript
getAcceptanceCertificateUrl(research_id)
generateAcceptanceCertificate(research_id)
regenerateAcceptanceCertificate(research_id)
```

#### 2. Download Utility
**الملف:** `apps/frontend/src/utils/downloadFile.ts`

```typescript
downloadAcceptanceCertificate(certificateUrl, researchNumber)
```

#### 3. View Research Page
**الملف:** `apps/frontend/src/pages/dashboard/researcher/ViewResearchPage.tsx`

**مميزات:**
- قسم مخصص لشهادة القبول
- يظهر فقط للأبحاث المقبولة/المنشورة
- زر تحميل بتصميم جذاب
- رسالة تهنئة للباحث

### Database Migration
**الملف:** `apps/backend/src/database/migrations/1735445574000-AddAcceptanceCertificateToResearch.ts`

## سير العمل

### 1. قبول البحث
```
المحرر/الأدمن يغير حالة البحث إلى "مقبول"
    ↓
يتم توليد شهادة القبول تلقائياً
    ↓
رفع الشهادة على Cloudinary
    ↓
حفظ معلومات الشهادة في قاعدة البيانات
    ↓
إرسال إشعار للباحث
```

### 2. تحميل الشهادة
```
الباحث يدخل صفحة عرض البحث
    ↓
يظهر قسم "شهادة قبول البحث"
    ↓
الباحث ينقر على "تحميل الشهادة"
    ↓
يتم الحصول على رابط التحميل من API
    ↓
تحميل الشهادة بصيغة PDF
```

## التثبيت والإعداد

### 1. تثبيت المكتبات
```bash
npm install pdfkit @types/pdfkit
```

### 2. تشغيل Migration
```bash
npx nx run backend:typeorm migration:run
```

### 3. إعادة تشغيل Backend
```bash
npx nx serve backend
```

## الاختبار

### 1. اختبار توليد الشهادة
```bash
# قبول بحث موجود
curl -X PATCH http://localhost:3000/api/research/{id}/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "accepted"}'
```

### 2. اختبار تحميل الشهادة
```bash
# الحصول على رابط الشهادة
curl -X GET http://localhost:3000/api/research/{id}/acceptance-certificate-url \
  -H "Authorization: Bearer {token}"
```

## التخصيص

### تخصيص التصميم
يمكن تعديل تصميم الشهادة من خلال:
- `apps/backend/src/modules/pdf/pdf-generator.service.ts`
- تغيير الألوان والخطوط
- إضافة شعار المجلة
- تعديل النصوص

### إضافة خطوط عربية
لدعم أفضل للغة العربية:
1. تحميل خط عربي (مثل: Cairo, Amiri)
2. إضافة الخط في `pdf-generator.service.ts`:
```typescript
doc.registerFont('Arabic', 'path/to/arabic-font.ttf');
doc.font('Arabic');
```

## الملاحظات

### الأمان
- الشهادات محمية بنفس صلاحيات الأبحاث
- روابط التحميل مؤقتة (Signed URLs)
- فقط صاحب البحث والإدارة يمكنهم التحميل

### الأداء
- الشهادات تُولد مرة واحدة وتُخزن
- استخدام Cloudinary للتخزين السحابي
- روابط تحميل سريعة

### الصيانة
- يمكن إعادة توليد الشهادة إذا لزم الأمر
- سجل كامل في قاعدة البيانات
- إمكانية حذف الشهادات القديمة

## المستقبل

### تحسينات مقترحة
1. إضافة QR Code على الشهادة للتحقق
2. إرسال الشهادة بالبريد الإلكتروني
3. إمكانية طباعة الشهادة مباشرة
4. إضافة رقم تسلسلي فريد
5. دعم لغات متعددة

## الدعم
للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
