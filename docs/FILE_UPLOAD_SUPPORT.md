# دعم رفع ملفات Word و PDF

## نظرة عامة
تم تحديث النظام لدعم رفع ملفات Word (doc/docx) بالإضافة إلى ملفات PDF عند تقديم أو تعديل الأبحاث.

## أنواع الملفات المدعومة

### الملفات المقبولة:
- **PDF**: `.pdf` (application/pdf)
- **Word 97-2003**: `.doc` (application/msword)
- **Word 2007+**: `.docx` (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

### الحد الأقصى لحجم الملف:
- **10 ميجابايت** لكل ملف

## التغييرات المطبقة

### 1. Frontend Changes

#### صفحة تقديم البحث (`SubmitResearchPage.tsx`)
- تم تحديث `accept` attribute في input لقبول PDF و Word
- تم إضافة validation للتحقق من نوع الملف قبل الرفع
- تم تحديث النصوص لتوضيح أن النظام يدعم PDF و Word

#### صفحة تعديل البحث (`ReviseResearchPage.tsx`)
- نفس التحديثات المطبقة على صفحة التقديم

### 2. Backend Changes

#### Cloudinary Service (`cloudinary.service.ts`)
- تم تحديث دالة `uploadResearchPDF()` لقبول ملفات Word
- تم إضافة validation للتحقق من امتداد الملف
- تم تغيير المجلد من `research/pdfs/` إلى `research/documents/`
- تم إزالة تحديد `format: 'pdf'` للسماح بأنواع ملفات متعددة

#### Research Controller (`research.controller.ts`)
- تم إضافة validation إضافي للتحقق من MIME type
- تم تحديث التعليقات لتوضيح دعم Word

### 3. Validation Layers

يتم التحقق من نوع الملف في 3 طبقات:

1. **Browser Level**: HTML5 `accept` attribute
2. **Frontend Validation**: التحقق من MIME type في JavaScript
3. **Backend Validation**: 
   - التحقق من MIME type في Controller
   - التحقق من امتداد الملف في Cloudinary Service

## استخدام النظام

### للباحثين:

1. **تقديم بحث جديد**:
   - اذهب إلى صفحة "تقديم بحث جديد"
   - املأ بيانات البحث
   - اختر ملف PDF أو Word من جهازك
   - سيتم رفع الملف تلقائياً إلى Cloudinary

2. **تعديل بحث**:
   - اذهب إلى صفحة "تعديل البحث"
   - اختر ملف PDF أو Word المعدل
   - سيتم رفع الملف الجديد واستبدال القديم

### رسائل الخطأ:

- **"يرجى اختيار ملف PDF أو Word (doc/docx) فقط"**: نوع الملف غير مدعوم
- **"حجم الملف يجب أن يكون أقل من 10 ميجابايت"**: الملف كبير جداً
- **"نوع الملف غير مدعوم"**: فشل validation في Backend

## ملاحظات تقنية

### Cloudinary Storage:
- يتم تخزين الملفات في مجلد: `research/documents/{research_number}`
- يتم استخدام `resource_type: 'raw'` لدعم جميع أنواع الملفات
- يتم تعيين `access_mode: 'public'` للسماح بالوصول العام

### MIME Types:
```javascript
const allowedMimeTypes = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];
```

### File Extensions:
```javascript
const allowedExtensions = ['pdf', 'doc', 'docx'];
```

## اختبار الميزة

### سيناريوهات الاختبار:

1. ✅ رفع ملف PDF صحيح
2. ✅ رفع ملف Word (.doc) صحيح
3. ✅ رفع ملف Word (.docx) صحيح
4. ❌ محاولة رفع ملف غير مدعوم (مثل .txt, .jpg)
5. ❌ محاولة رفع ملف أكبر من 10MB
6. ✅ استبدال ملف موجود بملف جديد

## الأمان

- يتم التحقق من نوع الملف في Frontend و Backend
- يتم التحقق من حجم الملف قبل الرفع
- يتم تنظيف أسماء الملفات لتجنب الأحرف الخاصة
- يتم استخدام research_number كاسم للملف لتجنب المشاكل مع الأحرف العربية

## التطوير المستقبلي

### اقتراحات للتحسين:
- إضافة معاينة للملفات قبل الرفع
- تحويل ملفات Word إلى PDF تلقائياً
- إضافة دعم لأنواع ملفات إضافية (مثل LaTeX)
- إضافة ضغط تلقائي للملفات الكبيرة
- إضافة مسح فيروسات للملفات المرفوعة

## الدعم الفني

في حالة مواجهة مشاكل:
1. تأكد من أن نوع الملف مدعوم (PDF, DOC, DOCX)
2. تأكد من أن حجم الملف أقل من 10MB
3. تأكد من اتصال الإنترنت
4. تحقق من إعدادات Cloudinary في `.env`

## المراجع

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [React File Upload Best Practices](https://react.dev/)
