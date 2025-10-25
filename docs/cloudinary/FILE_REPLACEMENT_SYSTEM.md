# نظام استبدال الملفات - دليل شامل

## 🎯 الهدف

التأكد من أن الملف الجديد الذي يرفعه الباحث عند التعديل يحل محل الملف القديم بشكل صحيح في قاعدة البيانات والنظام.

## 📊 بنية قاعدة البيانات

### جدول `research`
```sql
CREATE TABLE research (
  id UUID PRIMARY KEY,
  title VARCHAR(500),
  abstract TEXT,
  keywords JSON,
  specialization VARCHAR(255),
  file_url TEXT,              -- ⭐ الملف الرئيسي الحالي
  status VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### جدول `research_files`
```sql
CREATE TABLE research_files (
  id UUID PRIMARY KEY,
  research_id UUID REFERENCES research(id),
  file_name VARCHAR(255),
  file_url TEXT,
  file_type VARCHAR(100),
  file_size BIGINT,
  file_category ENUM('main', 'supplementary', 'revision'),
  uploaded_at TIMESTAMP
);
```

### جدول `research_revisions`
```sql
CREATE TABLE research_revisions (
  id UUID PRIMARY KEY,
  research_id UUID REFERENCES research(id),
  revision_number INTEGER,
  revision_notes TEXT,
  file_url TEXT,              -- ⭐ الملف المعدل
  status VARCHAR(50),
  submitted_at TIMESTAMP,
  created_at TIMESTAMP
);
```

## 🔄 كيف يعمل نظام استبدال الملفات

### المفهوم الأساسي:

1. **الملف الرئيسي** يُخزن في `research.file_url`
2. **الملفات الإضافية** تُخزن في `research_files`
3. **ملفات التعديلات** تُخزن في `research_revisions.file_url`

### عند التعديل:

```typescript
// 1. رفع الملف الجديد (TODO: S3/Cloudinary)
const newFileUrl = await uploadFile(file);

// 2. حفظ الملف في revision
await researchRevisionsService.submit(revisionId, newFileUrl);

// 3. استبدال الملف الرئيسي في research
await researchService.update(researchId, {
  file_url: newFileUrl,        // ⭐ هنا يتم الاستبدال
  abstract: newAbstract,
  keywords: newKeywords,
});

// 4. (اختياري) حفظ نسخة في research_files
await researchService.addFile({
  research_id: researchId,
  file_name: file.name,
  file_url: newFileUrl,
  file_type: file.type,
  file_size: file.size,
  file_category: 'revision',   // تمييز أنه ملف تعديل
});
```

## ✅ التحديثات المنفذة

### 1. إضافة `file_url` إلى Research Entity

**الملف:** `/apps/backend/src/database/entities/research.entity.ts`

```typescript
@Column({ type: 'text', nullable: true })
file_url!: string;
```

### 2. Migration لإضافة الحقل

**الملف:** `/apps/backend/src/database/migrations/add-file-url-to-research.ts`

```typescript
await queryRunner.addColumn(
  'research',
  new TableColumn({
    name: 'file_url',
    type: 'text',
    isNullable: true,
  })
);
```

### 3. تحديث في Frontend

**الملف:** `/apps/frontend/src/pages/dashboard/ReviseResearchPage.tsx`

```typescript
// عند إرسال التعديل
await researchService.update(research.id, {
  file_url: newFileUrl,      // ⭐ استبدال الملف
  abstract: formData.abstract,
  keywords: formData.keywords,
});
```

## 📝 تدفق العمل الكامل

### السيناريو 1: تقديم بحث جديد

```
1. الباحث يرفع ملف PDF
   ↓
2. يتم رفع الملف إلى التخزين (S3/Cloudinary)
   file_url = "https://storage.com/research/abc123.pdf"
   ↓
3. يتم حفظ البحث في قاعدة البيانات
   INSERT INTO research (file_url, ...) VALUES ('https://...', ...)
   ↓
4. (اختياري) حفظ في research_files
   INSERT INTO research_files (file_url, file_category, ...)
   VALUES ('https://...', 'main', ...)
```

### السيناريو 2: تعديل البحث

```
1. المحرر يطلب تعديلات
   ↓
   INSERT INTO research_revisions (research_id, revision_notes, ...)
   VALUES ('xxx', 'يرجى تحسين...', ...)
   
2. الباحث يرفع ملف جديد
   ↓
   new_file_url = "https://storage.com/research/abc123_rev1.pdf"
   
3. يتم تحديث revision
   ↓
   UPDATE research_revisions
   SET file_url = 'https://...', status = 'submitted'
   WHERE id = 'revision_id'
   
4. يتم استبدال الملف في research ⭐
   ↓
   UPDATE research
   SET file_url = 'https://storage.com/research/abc123_rev1.pdf',
       abstract = 'الملخص المعدل',
       keywords = '["كلمة1", "كلمة2"]',
       updated_at = NOW()
   WHERE id = 'research_id'
   
5. (اختياري) حفظ نسخة في research_files
   ↓
   INSERT INTO research_files (file_url, file_category, ...)
   VALUES ('https://...', 'revision', ...)
```

### السيناريو 3: تعديلات متعددة

```
التعديل الأول:
  research.file_url = "file_v1.pdf"
  research_revisions[0].file_url = "file_v1.pdf"

التعديل الثاني:
  research.file_url = "file_v2.pdf"  ⭐ تم الاستبدال
  research_revisions[1].file_url = "file_v2.pdf"

التعديل الثالث:
  research.file_url = "file_v3.pdf"  ⭐ تم الاستبدال
  research_revisions[2].file_url = "file_v3.pdf"
```

## 🔍 التحقق من الاستبدال

### في قاعدة البيانات:

```sql
-- عرض الملف الحالي
SELECT id, title, file_url, updated_at
FROM research
WHERE id = 'research_id';

-- عرض تاريخ الملفات
SELECT revision_number, file_url, submitted_at, status
FROM research_revisions
WHERE research_id = 'research_id'
ORDER BY revision_number DESC;

-- عرض جميع الملفات المرفقة
SELECT file_name, file_url, file_category, uploaded_at
FROM research_files
WHERE research_id = 'research_id'
ORDER BY uploaded_at DESC;
```

### في الكود:

```typescript
// قبل التعديل
const oldFileUrl = research.file_url;
console.log('Old file:', oldFileUrl);

// بعد التعديل
const updatedResearch = await researchService.update(id, {
  file_url: newFileUrl,
});
console.log('New file:', updatedResearch.file_url);

// التحقق
assert(updatedResearch.file_url === newFileUrl);
assert(updatedResearch.file_url !== oldFileUrl);
```

## 📦 خيارات التخزين

### الخيار 1: استبدال مباشر (الحالي)
```typescript
// الملف الجديد يحل محل القديم مباشرة
research.file_url = newFileUrl;
```

**المميزات:**
- ✅ بسيط ومباشر
- ✅ دائماً يشير للملف الأحدث
- ✅ لا حاجة لمنطق معقد

**العيوب:**
- ❌ لا يمكن الرجوع للملف القديم
- ❌ قد نفقد الملفات السابقة

### الخيار 2: حفظ جميع النسخ
```typescript
// حفظ الملف الجديد في research
research.file_url = newFileUrl;

// حفظ نسخة في research_files
await researchService.addFile({
  file_url: newFileUrl,
  file_category: 'revision',
  // ... metadata
});
```

**المميزات:**
- ✅ يحفظ جميع النسخ
- ✅ يمكن الرجوع للملفات القديمة
- ✅ سجل كامل

**العيوب:**
- ❌ يستهلك مساحة تخزين أكبر
- ❌ يحتاج منطق لإدارة الملفات

### الخيار 3: استخدام research_revisions فقط
```typescript
// الملف الحالي = آخر revision
const latestRevision = await getLatestRevision(researchId);
const currentFileUrl = latestRevision?.file_url || research.original_file_url;
```

**المميزات:**
- ✅ كل شيء في مكان واحد
- ✅ سهل التتبع

**العيوب:**
- ❌ يحتاج query إضافي
- ❌ أكثر تعقيداً

## 🎯 التوصية الحالية

**استخدام الخيار 1 + الخيار 2 معاً:**

```typescript
// 1. استبدال الملف الرئيسي (للوصول السريع)
await researchService.update(researchId, {
  file_url: newFileUrl,
});

// 2. حفظ نسخة في research_files (للأرشفة)
await researchService.addFile({
  research_id: researchId,
  file_url: newFileUrl,
  file_category: 'revision',
  // ... metadata
});

// 3. حفظ في research_revisions (للتتبع)
await researchRevisionsService.submit(revisionId, newFileUrl);
```

**الفوائد:**
- ✅ الملف الحالي دائماً في `research.file_url`
- ✅ جميع النسخ محفوظة في `research_files`
- ✅ سجل كامل في `research_revisions`
- ✅ يمكن الرجوع لأي نسخة سابقة

## 🔧 التطبيق العملي

### في ReviseResearchPage:

```typescript
const handleSubmit = async () => {
  // 1. رفع الملف
  const newFileUrl = await uploadFile(formData.file);
  
  // 2. تحديث revision
  await researchRevisionsService.submit(revisionId, newFileUrl);
  
  // 3. استبدال الملف الرئيسي ⭐
  await researchService.update(research.id, {
    file_url: newFileUrl,
    abstract: formData.abstract,
    keywords: formData.keywords,
  });
  
  // 4. (اختياري) حفظ نسخة للأرشفة
  await researchService.addFile({
    research_id: research.id,
    file_name: formData.file.name,
    file_url: newFileUrl,
    file_type: formData.file.type,
    file_size: formData.file.size,
    file_category: 'revision',
  });
};
```

## 🧪 الاختبار

### اختبار الاستبدال:

```typescript
// 1. تقديم بحث جديد
const research = await createResearch({
  title: 'بحث تجريبي',
  file_url: 'file_v0.pdf',
});

// التحقق
expect(research.file_url).toBe('file_v0.pdf');

// 2. التعديل الأول
await updateResearch(research.id, {
  file_url: 'file_v1.pdf',
});

const updated1 = await getResearch(research.id);
expect(updated1.file_url).toBe('file_v1.pdf');  // ✅ تم الاستبدال

// 3. التعديل الثاني
await updateResearch(research.id, {
  file_url: 'file_v2.pdf',
});

const updated2 = await getResearch(research.id);
expect(updated2.file_url).toBe('file_v2.pdf');  // ✅ تم الاستبدال
expect(updated2.file_url).not.toBe('file_v1.pdf');
```

## ✅ الخلاصة

### ما تم إنجازه:

1. ✅ إضافة `file_url` إلى `research` entity
2. ✅ إنشاء migration لإضافة الحقل
3. ✅ تحديث الكود في frontend لاستبدال الملف
4. ✅ توثيق كامل للنظام

### كيف يعمل الآن:

- 📄 **الملف الحالي**: دائماً في `research.file_url`
- 📚 **تاريخ الملفات**: في `research_revisions`
- 🗄️ **الأرشيف**: (اختياري) في `research_files`

### عند التعديل:

```
الملف القديم: research.file_url = "old.pdf"
         ↓
الباحث يرفع ملف جديد
         ↓
الملف الجديد: research.file_url = "new.pdf"  ⭐ تم الاستبدال
```

**النظام الآن يضمن أن الملف الجديد يحل محل القديم بشكل صحيح!** ✅

---

**تم التطوير بواسطة:** Cascade AI  
**التاريخ:** 2024  
**الإصدار:** 1.0.0
