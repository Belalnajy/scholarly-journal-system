# إضافة ISSN وموقع الجامعة للمجلة

## نظرة عامة
تم إضافة حقلين جديدين لإعدادات الموقع:
- **ISSN**: رقم التسلسل المعياري الدولي للمجلة (مثال: 1987-1910)
- **موقع الجامعة**: رابط الموقع الإلكتروني للجامعة التابعة للمجلة

## التغييرات في Backend

### 1. قاعدة البيانات
**الملف**: `apps/backend/src/database/entities/site-settings.entity.ts`

تم إضافة حقلين جديدين:
```typescript
@Column({ nullable: true })
journal_issn!: string;

@Column({ nullable: true })
university_url!: string;
```

### 2. Migration
**الملف**: `apps/backend/src/database/migrations/1730900000000-AddIssnAndUniversityUrlToSiteSettings.ts`

Migration جديد لإضافة الحقول في قاعدة البيانات.

**لتشغيل Migration:**
```bash
cd apps/backend
npm run migration:run
```

### 3. خطاب القبول (PDF)
**الملفات المحدثة**:
- `apps/backend/src/modules/pdf/acceptance-letter-template.html`
- `apps/backend/src/modules/pdf/pdf-generator.service.ts`

تم إضافة ISSN في رأس خطاب القبول بلون ذهبي مميز.

## التغييرات في Frontend

### 1. Types
**الملف**: `apps/frontend/src/services/site-settings.service.ts`

تم تحديث interfaces:
```typescript
export interface SiteSettings {
  // ... existing fields
  journal_issn?: string;
  university_url?: string;
}

export interface UpdateSiteSettingsDto {
  // ... existing fields
  journal_issn?: string;
  university_url?: string;
}
```

### 2. صفحة الإعدادات (Admin)
**الملف**: `apps/frontend/src/pages/dashboard/admin/SiteSettingsPage.tsx`

تم إضافة 4 حقول جديدة في قسم "المعلومات الأساسية":
- رقم ISSN
- موقع الجامعة
- DOI المجلة
- رابط المجلة

### 3. Footer
**الملف**: `apps/frontend/src/components/layout/Footer.tsx`

تم إضافة عرض:
- رقم ISSN بلون ذهبي في أسفل الصفحة
- رابط موقع الجامعة (قابل للنقر)

### 4. صفحة "عن المجلة"
**الملف**: `apps/frontend/src/pages/AboutPage.tsx`

تم إضافة عرض ISSN وموقع الجامعة في رأس الصفحة.

## الأماكن التي يظهر فيها ISSN وموقع الجامعة

### ISSN يظهر في:
1. ✅ **Footer** - في أسفل جميع الصفحات (بلون ذهبي)
2. ✅ **صفحة عن المجلة** - في رأس الصفحة
3. ✅ **خطاب القبول (PDF)** - في رأس الخطاب
4. ✅ **صفحة إعدادات الموقع** - للإدارة والتعديل

### موقع الجامعة يظهر في:
1. ✅ **Footer** - رابط قابل للنقر في أسفل جميع الصفحات
2. ✅ **صفحة عن المجلة** - رابط في رأس الصفحة
3. ✅ **صفحة إعدادات الموقع** - للإدارة والتعديل

## كيفية الإعداد

### 1. تحديث قاعدة البيانات

**الطريقة الأولى: باستخدام TypeORM Migration**
```bash
cd apps/backend
npm run migration:run
```

**الطريقة الثانية: SQL مباشر (إذا لم تعمل Migration)**
قم بتشغيل الأوامر التالية في قاعدة البيانات:
```sql
-- إضافة حقل ISSN
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS journal_issn TEXT;

-- إضافة حقل موقع الجامعة
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS university_url TEXT;
```

**الطريقة الثالثة: إعادة تشغيل Backend**
إذا كان TypeORM في وضع `synchronize: true`، سيتم إضافة الحقول تلقائياً عند إعادة تشغيل Backend.

### 2. إضافة البيانات من لوحة التحكم
1. سجل دخول كـ Admin
2. اذهب إلى **إعدادات الموقع**
3. في قسم "المعلومات الأساسية"، أضف:
   - **رقم ISSN**: `1987-1910`
   - **موقع الجامعة**: رابط موقع الجامعة
   - **DOI المجلة**: (اختياري)
   - **رابط المجلة**: (اختياري)
4. احفظ التغييرات

### 3. التحقق من الظهور
- تحقق من Footer في أي صفحة
- تحقق من صفحة "عن المجلة"
- قم بتوليد خطاب قبول لبحث وتحقق من ظهور ISSN

## ملاحظات تقنية

### التصميم
- **ISSN**: يظهر بلون ذهبي (#b2823e) لجذب الانتباه
- **موقع الجامعة**: رابط تفاعلي مع تأثير hover
- **خطاب القبول**: ISSN بخط bold وحجم 11px

### الأمان
- جميع الحقول اختيارية (nullable)
- التحقق من صحة URL في Frontend
- يمكن ترك الحقول فارغة إذا لم تكن متوفرة

### التوافق
- ✅ متوافق مع جميع المتصفحات
- ✅ Responsive على جميع الأجهزة
- ✅ يدعم RTL و LTR

## أمثلة الاستخدام

### مثال 1: ISSN فقط
```typescript
journal_issn: "1987-1910"
university_url: null
```
النتيجة: سيظهر ISSN فقط في Footer وصفحة عن المجلة

### مثال 2: كلاهما
```typescript
journal_issn: "1987-1910"
university_url: "https://university.edu.sa"
```
النتيجة: سيظهر كلاهما في جميع الأماكن

### مثال 3: بدون بيانات
```typescript
journal_issn: null
university_url: null
```
النتيجة: لن يظهر أي شيء (لا يؤثر على التصميم)

## الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تأكد من تشغيل Migration
2. تحقق من إدخال البيانات في صفحة الإعدادات
3. امسح cache المتصفح
4. أعد تشغيل الـ Backend والـ Frontend

---

**تاريخ الإضافة**: 2025-01-11
**الإصدار**: 1.0.0
