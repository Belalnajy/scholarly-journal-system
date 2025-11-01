# ميزة تحديث ملف البحث من قبل الأدمن

## نظرة عامة
تتيح هذه الميزة للأدمن/المحرر تحديث ملف البحث بعد قبوله، مما يسمح بإضافة الغلاف والتنسيق النهائي قبل النشر.

## المكونات

### Backend

#### 1. Database Changes
**Entity: `research.entity.ts`**
- `file_updated_at`: تاريخ آخر تحديث للملف
- `file_updated_by`: معرف المستخدم الذي قام بالتحديث

**Migration: `add-file-update-tracking.ts`**
```sql
ALTER TABLE research ADD COLUMN file_updated_at TIMESTAMP NULL;
ALTER TABLE research ADD COLUMN file_updated_by UUID NULL;
```

#### 2. API Endpoint
**PATCH `/api/research/:id/update-file`**
- **الصلاحيات:** Admin, Editor فقط
- **المدخلات:** ملف (PDF أو Word)
- **الوظيفة:**
  1. حذف الملف القديم من Cloudinary
  2. رفع الملف الجديد
  3. تحديث معلومات البحث
  4. تسجيل تاريخ التحديث ومن قام به
  5. إرسال إشعار للباحث

#### 3. Service Method
**`ResearchService.updateResearchFile()`**
```typescript
async updateResearchFile(
  research_id: string,
  fileBuffer: Buffer,
  fileName: string,
  fileSize: number,
  updated_by_user_id: string
): Promise<Research>
```

### Frontend

#### 1. Service Method
**`researchService.updateResearchFile()`**
```typescript
async updateResearchFile(
  research_id: string,
  file: File
): Promise<Research>
```

#### 2. UI Components
**صفحة: `EditorResearchDetailsPage.tsx`**

**زر تحديث الملف:**
- يظهر فقط للأبحاث المقبولة أو المنشورة
- يفتح Modal لرفع الملف

**Modal تحديث الملف:**
- اختيار ملف (PDF/Word، حتى 10MB)
- معاينة الملف المختار
- عرض تاريخ آخر تحديث
- رسائل توضيحية للمستخدم

## سير العمل

### 1. قبول البحث
```
الأدمن → يقبل البحث → status = 'accepted'
```

### 2. تحديث الملف
```
الأدمن → يضغط "تحديث ملف البحث"
       → يختار الملف المعدل (مع الغلاف)
       → يرفع الملف
       → يتم استبدال الملف القديم
       → يُرسل إشعار للباحث
```

### 3. النشر
```
الأدمن → ينشر البحث → status = 'published'
```

## الميزات الأمنية

### 1. التحقق من الصلاحيات
- فقط Admin و Editor يمكنهم تحديث الملف
- يتم التحقق من الصلاحيات في الـ Guard

### 2. التحقق من نوع الملف
```typescript
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
```

### 3. التحقق من حجم الملف
- الحد الأقصى: 10 ميجابايت

### 4. تسجيل التعديلات
- يتم حفظ تاريخ التحديث
- يتم حفظ معرف من قام بالتحديث

## الإشعارات

عند تحديث الملف، يتم إرسال إشعار للباحث:
```
العنوان: "تم تحديث ملف البحث"
الرسالة: "تم تحديث ملف البحث '[عنوان البحث]' من قبل الإدارة. يمكنك تحميل النسخة المحدثة الآن."
```

## حالات الاستخدام

### 1. إضافة غلاف المجلة
```
البحث مقبول → الأدمن يحمل الملف
             → يضيف الغلاف في برنامج تحرير
             → يرفع الملف المعدل
             → الباحث يحصل على النسخة النهائية
```

### 2. تصحيح التنسيق
```
البحث منشور → الأدمن يلاحظ خطأ في التنسيق
            → يصحح التنسيق
            → يرفع الملف المحدث
            → النسخة المنشورة تُحدث تلقائياً
```

### 3. إضافة معلومات النشر
```
البحث مقبول → الأدمن يضيف:
              - رقم العدد
              - تاريخ النشر
              - DOI
              - رقم الصفحات
            → يرفع الملف النهائي
```

## الاختبار

### 1. اختبار Backend
```bash
# Test endpoint
curl -X PATCH http://localhost:3000/api/research/{id}/update-file \
  -H "Authorization: Bearer {admin_token}" \
  -F "file=@research_with_cover.pdf"
```

### 2. اختبار Frontend
1. تسجيل دخول كـ Admin
2. الذهاب لتفاصيل بحث مقبول
3. الضغط على "تحديث ملف البحث"
4. اختيار ملف PDF
5. الضغط على "تحديث الملف"
6. التحقق من نجاح الرفع
7. تحميل الملف والتأكد من التحديث

## الأخطاء الشائعة

### 1. "نوع الملف غير مدعوم"
**السبب:** الملف ليس PDF أو Word
**الحل:** استخدم ملف PDF أو Word فقط

### 2. "حجم الملف كبير جداً"
**السبب:** حجم الملف أكبر من 10MB
**الحل:** ضغط الملف أو تقليل جودة الصور

### 3. "فشل تحديث الملف"
**السبب:** مشكلة في الاتصال بـ Cloudinary
**الحل:** التحقق من إعدادات Cloudinary في `.env`

## الصيانة

### 1. تنظيف الملفات القديمة
الملفات القديمة يتم حذفها تلقائياً من Cloudinary عند رفع ملف جديد.

### 2. مراقبة الاستخدام
يمكن مراقبة عدد مرات تحديث الملفات من خلال:
```sql
SELECT 
  COUNT(*) as total_updates,
  DATE(file_updated_at) as update_date
FROM research
WHERE file_updated_at IS NOT NULL
GROUP BY DATE(file_updated_at)
ORDER BY update_date DESC;
```

## الملاحظات

1. **لا يؤثر على حالة البحث:** تحديث الملف لا يغير status البحث
2. **يحتفظ بالبيانات الوصفية:** العنوان، الملخص، الكلمات المفتاحية تبقى كما هي
3. **يمكن التحديث عدة مرات:** لا يوجد حد لعدد مرات تحديث الملف
4. **الباحث يُشعر دائماً:** يتم إرسال إشعار للباحث في كل مرة

## التطوير المستقبلي

- [ ] إضافة سجل كامل لتاريخ التعديلات (audit log)
- [ ] إمكانية مقارنة النسخ المختلفة
- [ ] إضافة ملاحظات عند التحديث
- [ ] إمكانية التراجع عن التحديث
