# عرض الملف الأصلي في صفحة عرض البحث

## 📋 الوصف

تم إضافة ميزة عرض الملف الأصلي (قبل التعديلات) في صفحة عرض البحث `ViewResearchPage.tsx`. هذه الميزة تسمح للباحث برؤية وتحميل النسخة الأولى من البحث قبل إجراء أي تعديلات.

## 🎯 كيف يعمل النظام

### 1. حفظ البيانات الأصلية

عندما يطلب المحرر تعديلات على البحث، يتم حفظ البيانات الأصلية في `research_revisions.original_data`:

```typescript
// في research-revision.entity.ts
@Column({ type: 'jsonb', nullable: true })
original_data: {
  abstract?: string;
  keywords?: string[];
  file_url?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
};
```

### 2. عرض الملف الأصلي

في `ViewResearchPage.tsx`، يتم عرض الملف الأصلي فقط إذا:
- كان هناك تعديلات مُرسلة (`status: 'submitted'`)
- كان التعديل الأول يحتوي على `original_data`
- كان `original_data` يحتوي على `cloudinary_secure_url` أو `file_url`

```typescript
// Get submitted revisions and first revision for original data
const submittedRevisions = revisions.filter(r => r.status === 'submitted');
const hasSubmittedRevisions = submittedRevisions.length > 0;
const firstRevision = submittedRevisions.sort((a, b) => a.revision_number - b.revision_number)[0];
const hasOriginalFile = firstRevision?.original_data && 
  (firstRevision.original_data.cloudinary_secure_url || firstRevision.original_data.file_url);
```

## 🎨 واجهة المستخدم

### قبل التعديلات (لا توجد تعديلات مُرسلة)

```
┌─────────────────────────────────────────┐
│ ملف البحث الرئيسي                      │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 ملف البحث (PDF)                 │ │
│ │ RES-2025-0011 • PDF Document       │ │
│ │                   [تحميل البحث] ⬇️ │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### بعد التعديلات (توجد تعديلات مُرسلة)

```
┌─────────────────────────────────────────┐
│ ملف البحث الأصلي (قبل التعديلات)      │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 الملف الأصلي (PDF)              │ │
│ │ RES-2025-0011 • النسخة الأولى قبل   │ │
│ │ التعديلات    [تحميل الملف الأصلي] ⬇️│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ملف البحث الحالي (بعد التعديلات)      │
│ ┌─────────────────────────────────────┐ │
│ │ 📄 الملف الحالي (PDF)              │ │
│ │ RES-2025-0011 • النسخة المعدلة      │ │
│ │ (2 تعديل)  [تحميل النسخة الحالية] ⬇️│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🎨 التصميم

### الملف الأصلي
- **اللون**: بنفسجي (Purple)
- **الخلفية**: `from-purple-50 to-purple-100`
- **الحدود**: `border-purple-200`
- **الأيقونة**: `text-purple-600`
- **الزر**: `bg-purple-600 hover:bg-purple-700`

### الملف الحالي
- **اللون**: أزرق (Blue)
- **الخلفية**: `from-blue-50 to-blue-100`
- **الحدود**: `border-blue-200`
- **الأيقونة**: `text-blue-600`
- **الزر**: `bg-[#0D3B66] hover:bg-[#0D3B66]/90`

## 📝 الدوال الجديدة

### `handleDownloadOriginalPDF()`

```typescript
const handleDownloadOriginalPDF = async () => {
  // Get the first submitted revision to access original_data
  const firstRevision = revisions
    .filter(r => r.status === 'submitted')
    .sort((a, b) => a.revision_number - b.revision_number)[0];

  const originalCloudinaryUrl = firstRevision?.original_data?.cloudinary_secure_url;
  const originalFileUrl = firstRevision?.original_data?.file_url;

  if (!originalCloudinaryUrl && !originalFileUrl) {
    toast.error('لا يوجد ملف أصلي للتحميل');
    return;
  }

  try {
    toast.loading('جاري تحميل الملف الأصلي...', { id: 'download-original-pdf' });
    await downloadResearchPdf(originalCloudinaryUrl, originalFileUrl, research?.research_number || 'original');
    toast.success('تم بدء التحميل', { id: 'download-original-pdf' });
  } catch (error) {
    toast.error('فشل تحميل الملف الأصلي', { id: 'download-original-pdf' });
    console.error('Error downloading original PDF:', error);
  }
};
```

## 🔄 تدفق العمل

### السيناريو 1: بحث بدون تعديلات

```
1. الباحث يرفع بحث جديد
   ↓
2. research.file_url = "file_v0.pdf"
   research.cloudinary_secure_url = "cloudinary://..."
   ↓
3. في ViewResearchPage:
   - يظهر: "ملف البحث الرئيسي"
   - لا يظهر: "ملف البحث الأصلي"
```

### السيناريو 2: بحث مع تعديل واحد

```
1. المحرر يطلب تعديلات
   ↓
2. يتم إنشاء revision مع حفظ البيانات الأصلية:
   revision.original_data = {
     file_url: "file_v0.pdf",
     cloudinary_secure_url: "cloudinary://...",
     abstract: "الملخص الأصلي",
     keywords: ["كلمة1", "كلمة2"]
   }
   ↓
3. الباحث يرفع ملف معدل
   ↓
4. research.file_url = "file_v1.pdf" (تم الاستبدال)
   revision.file_url = "file_v1.pdf"
   revision.status = "submitted"
   ↓
5. في ViewResearchPage:
   - يظهر: "ملف البحث الأصلي (قبل التعديلات)" ← من revision.original_data
   - يظهر: "ملف البحث الحالي (بعد التعديلات)" ← من research.file_url
```

### السيناريو 3: بحث مع تعديلات متعددة

```
1. التعديل الأول:
   revision[0].original_data.file_url = "file_v0.pdf" (الأصلي)
   revision[0].file_url = "file_v1.pdf"
   research.file_url = "file_v1.pdf"
   
2. التعديل الثاني:
   revision[1].original_data.file_url = "file_v1.pdf"
   revision[1].file_url = "file_v2.pdf"
   research.file_url = "file_v2.pdf"
   
3. في ViewResearchPage:
   - "ملف البحث الأصلي" ← من revision[0].original_data (file_v0.pdf)
   - "ملف البحث الحالي" ← من research.file_url (file_v2.pdf)
   - عدد التعديلات: 2
```

## ✅ المميزات

1. **عرض الملف الأصلي**: يمكن للباحث رؤية وتحميل النسخة الأولى من البحث
2. **تمييز واضح**: ألوان مختلفة للملف الأصلي (بنفسجي) والحالي (أزرق)
3. **معلومات دقيقة**: عرض عدد التعديلات المُرسلة
4. **تحميل مباشر**: استخدام نفس نظام التحميل المُحسّن من Cloudinary
5. **واجهة ديناميكية**: تتغير العناوين والأوصاف حسب حالة البحث

## 🧪 الاختبار

### اختبار 1: بحث بدون تعديلات
```
✅ يظهر "ملف البحث الرئيسي" فقط
✅ لا يظهر "ملف البحث الأصلي"
✅ زر التحميل يعمل بشكل صحيح
```

### اختبار 2: بحث مع تعديل واحد
```
✅ يظهر "ملف البحث الأصلي (قبل التعديلات)"
✅ يظهر "ملف البحث الحالي (بعد التعديلات)"
✅ عدد التعديلات = 1
✅ تحميل الملف الأصلي يعمل
✅ تحميل الملف الحالي يعمل
```

### اختبار 3: بحث مع تعديلات متعددة
```
✅ يظهر الملف الأصلي من أول revision
✅ يظهر الملف الحالي من research
✅ عدد التعديلات صحيح (مثلاً: 3 تعديل)
✅ جميع أزرار التحميل تعمل
```

## 📦 الملفات المُعدلة

### `/apps/frontend/src/pages/dashboard/researcher/ViewResearchPage.tsx`

**التغييرات:**
1. إضافة دالة `handleDownloadOriginalPDF()`
2. إضافة متغيرات للتحقق من وجود تعديلات:
   - `submittedRevisions`
   - `hasSubmittedRevisions`
   - `firstRevision`
   - `hasOriginalFile`
3. إضافة قسم "ملف البحث الأصلي (قبل التعديلات)"
4. تحديث قسم "ملف البحث الرئيسي" ليصبح ديناميكي

## 🔗 الملفات ذات الصلة

- `/apps/backend/src/database/entities/research-revision.entity.ts` - تعريف `original_data`
- `/apps/frontend/src/services/research-revisions.service.ts` - نوع `ResearchRevision`
- `/apps/frontend/src/utils/downloadFile.ts` - دوال التحميل
- `FILE_REPLACEMENT_SYSTEM.md` - توثيق نظام استبدال الملفات

## 🎉 النتيجة النهائية

الآن الباحث يمكنه:
- ✅ رؤية الملف الأصلي الذي رفعه أول مرة
- ✅ رؤية الملف الحالي بعد التعديلات
- ✅ تحميل أي من الملفين
- ✅ معرفة عدد التعديلات التي تم إجراؤها
- ✅ التمييز بسهولة بين الملف الأصلي والحالي

---

**تم التطوير بواسطة:** Cascade AI  
**التاريخ:** 2025-01-23  
**الإصدار:** 1.0.0
