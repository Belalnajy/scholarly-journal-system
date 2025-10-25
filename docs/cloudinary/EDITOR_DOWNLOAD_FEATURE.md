# تحديث صفحات المحرر - نظام التحميل

## الصفحات المحدثة
1. **EditorResearchDetailsPage** - صفحة تفاصيل البحث
2. **EditorReviewDetailsPage** - صفحة تفاصيل المراجعة

## التحديثات المنفذة

### 1. إضافة دوال التحميل
تم إضافة دالتين لتحميل الملفات:

```typescript
// تحميل البحث الأصلي
const handleDownloadOriginal = async () => {
  await downloadResearchPdf(
    research.cloudinary_secure_url, 
    research.file_url, 
    research.research_number
  );
}

// تحميل النسخة المعدلة
const handleDownloadRevision = async (revision: ResearchRevision) => {
  await downloadRevisionFile(
    revision.cloudinary_secure_url, 
    revision.file_url, 
    revision.revision_number
  );
}
```

### 2. تحديث واجهة المستخدم

#### أزرار التحميل الرئيسية (في قسم Action Buttons):
- ✅ **زر تحميل البحث الأصلي** (أزرق): يظهر دائماً إذا كان هناك ملف
- ✅ **زر تحميل البحث المعدل** (برتقالي): يظهر فقط عند وجود تعديلات مرسلة
- ✅ **زر تعيين محكم** (ذهبي): يظهر فقط للأبحاث تحت المراجعة

#### أزرار التحميل في قسم التعديلات:
- كل تعديل له زر تحميل خاص به
- يمكن تحميل أي نسخة معدلة بشكل منفصل

### 3. الربط مع Cloudinary

النظام يستخدم:
1. **cloudinary_secure_url**: الرابط الأساسي من Cloudinary
2. **file_url**: رابط احتياطي (fallback)
3. **downloadFile utility**: يضيف `fl_attachment` للإجبار على التحميل المباشر

### 4. Toast Notifications

- 🔄 **Loading**: "جاري تحميل البحث الأصلي..." / "جاري تحميل النسخة المعدلة..."
- ✅ **Success**: "تم بدء التحميل"
- ❌ **Error**: "فشل تحميل الملف"

## الملفات المعدلة

### 1. **EditorResearchDetailsPage.tsx**
   - إضافة imports: `downloadResearchPdf`, `downloadRevisionFile`, `toast`
   - إضافة دوال: `handleDownloadOriginal()`, `handleDownloadRevision()`
   - تحديث UI: أزرار التحميل في قسم Action Buttons
   - تحديث UI: أزرار التحميل في قسم Revision History

### 2. **EditorReviewDetailsPage.tsx**
   - إضافة imports: `downloadResearchPdf`, `downloadRevisionFile`, `toast`
   - إضافة دوال: `handleDownloadOriginal()`, `handleDownloadRevision()`
   - تحديث UI: أزرار التحميل في قسم Download Buttons
   - تحديث UI: أزرار التحميل في قسم Revision History
   - دعم عرض تقييمات المحكمين مع إمكانية تحميل الملفات

## التدفق الكامل

```
1. المحرر يفتح صفحة تفاصيل البحث
   ↓
2. يتم تحميل البيانات من API:
   - research (البحث الأصلي)
   - revisions (التعديلات)
   - assignments (المحكمين)
   ↓
3. يظهر زر "تحميل البحث الأصلي" (دائماً)
   ↓
4. إذا كان هناك تعديلات:
   - يظهر زر "تحميل البحث المعدل" (أحدث نسخة)
   - يظهر قسم "تعديلات الباحث"
   - كل تعديل له زر تحميل خاص
   ↓
5. عند الضغط على أي زر تحميل:
   - يظهر toast loading
   - يتم استدعاء downloadFile utility
   - يتم إضافة fl_attachment للرابط
   - يتم تحميل الملف مباشرة
   - يظهر toast success/error
```

## الاختبار

### اختبار تحميل البحث الأصلي:
1. افتح صفحة تفاصيل أي بحث
2. اضغط على "تحميل البحث الأصلي (PDF)"
3. تأكد من بدء التحميل مباشرة

### اختبار تحميل البحث المعدل:
1. افتح صفحة تفاصيل بحث له تعديلات
2. اضغط على "تحميل البحث المعدل (PDF)"
3. تأكد من تحميل أحدث نسخة معدلة

### اختبار تحميل نسخة معدلة محددة:
1. انزل لقسم "تعديلات الباحث"
2. اضغط على زر التحميل في أي تعديل
3. تأكد من تحميل النسخة الصحيحة

## الحالات الخاصة

- ✅ **بحث بدون ملف**: لا يظهر زر التحميل
- ✅ **بحث بدون تعديلات**: يظهر زر البحث الأصلي فقط
- ✅ **بحث مع تعديلات**: يظهر الزرين (أصلي + معدل)
- ✅ **فشل التحميل**: يظهر toast error مع fallback

## الأمان

- ✅ استخدام Cloudinary signed URLs للملفات القديمة
- ✅ استخدام public URLs للملفات الجديدة
- ✅ التحقق من وجود الملف قبل المحاولة
- ✅ معالجة الأخطاء بشكل صحيح
