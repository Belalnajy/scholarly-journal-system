# حفظ البيانات الأصلية - دليل شامل

## 🎯 الهدف

حفظ الملخص والكلمات المفتاحية الأصلية قبل التعديل لعرضها في المقارنة، حتى يتمكن المحكم من رؤية الفرق بين القديم والجديد بوضوح.

## 📊 التحديثات على قاعدة البيانات

### جدول `research_revisions`

#### قبل:
```sql
CREATE TABLE research_revisions (
  id UUID,
  research_id UUID,
  revision_number INTEGER,
  revision_notes TEXT,
  file_url TEXT,
  status VARCHAR(50),
  ...
);
```

#### بعد:
```sql
CREATE TABLE research_revisions (
  id UUID,
  research_id UUID,
  revision_number INTEGER,
  revision_notes TEXT,
  file_url TEXT,
  original_data JSONB,  -- ⭐ جديد: البيانات الأصلية
  status VARCHAR(50),
  ...
);
```

### بنية `original_data`:
```json
{
  "abstract": "الملخص الأصلي قبل التعديل",
  "keywords": ["كلمة1", "كلمة2", "كلمة3"],
  "file_url": "https://storage.com/old_file.pdf"
}
```

## 🔄 كيف يعمل النظام

### عند طلب التعديل (PendingDecisionPage):

```typescript
// 1. جلب البيانات الحالية
const currentResearch = await researchService.getById(id);

// 2. حفظ البيانات الأصلية في revision
await researchRevisionsService.create({
  research_id: id,
  revision_notes: editorNotes,
  original_data: {
    abstract: currentResearch.abstract,      // ⭐ حفظ الملخص الأصلي
    keywords: currentResearch.keywords,      // ⭐ حفظ الكلمات الأصلية
    file_url: currentResearch.file_url,      // ⭐ حفظ الملف الأصلي
  },
  deadline: new Date(...).toISOString(),
});
```

### عند التعديل (ReviseResearchPage):

```typescript
// الباحث يعدل البيانات
await researchService.update(research.id, {
  abstract: newAbstract,        // الملخص الجديد
  keywords: newKeywords,        // الكلمات الجديدة
  file_url: newFileUrl,         // الملف الجديد
});

// البيانات الأصلية محفوظة في revision.original_data
```

### عند العرض (EvaluationFormPage):

```tsx
{/* الملخص الأصلي */}
<div className="bg-red-50">
  <h4>✖ الملخص الأصلي</h4>
  <p className="line-through">
    {revision.original_data?.abstract}
  </p>
</div>

{/* الملخص المعدل */}
<div className="bg-green-50">
  <h4>✔ الملخص المعدل</h4>
  <p>
    {research.abstract}
  </p>
</div>
```

## 📝 التدفق الكامل

### السيناريو الكامل:

```
1. البحث الأصلي:
   research.abstract = "ملخص أصلي"
   research.keywords = ["كلمة1", "كلمة2"]
   research.file_url = "file_v1.pdf"

2. المحرر يطلب تعديلات:
   ↓
   INSERT INTO research_revisions (
     original_data = {
       "abstract": "ملخص أصلي",
       "keywords": ["كلمة1", "كلمة2"],
       "file_url": "file_v1.pdf"
     }
   )

3. الباحث يعدل:
   ↓
   UPDATE research SET
     abstract = "ملخص معدل ومحسن",
     keywords = ["كلمة1", "كلمة2", "كلمة3"],
     file_url = "file_v2.pdf"

4. المحكم يرى المقارنة:
   ┌─────────────────────────┐  ┌─────────────────────────┐
   │ ✖ الملخص الأصلي        │  │ ✔ الملخص المعدل        │
   │ ملخص أصلي (مشطوب)      │  │ ملخص معدل ومحسن        │
   └─────────────────────────┘  └─────────────────────────┘
   
   ┌─────────────────────────┐  ┌─────────────────────────┐
   │ ✖ الكلمات الأصلية      │  │ ✔ الكلمات المعدلة      │
   │ 🏷️ كلمة1 (مشطوب)      │  │ 🏷️ كلمة1               │
   │ 🏷️ كلمة2 (مشطوب)      │  │ 🏷️ كلمة2               │
   │                         │  │ 🏷️ كلمة3 (جديد)        │
   └─────────────────────────┘  └─────────────────────────┘
```

## ✅ التحديثات المنفذة

### 1. Backend

#### Entity:
**الملف:** `/apps/backend/src/database/entities/research-revision.entity.ts`

```typescript
@Column({ type: 'jsonb', nullable: true })
original_data: {
  abstract?: string;
  keywords?: string[];
  file_url?: string;
};
```

#### DTO:
**الملف:** `/apps/backend/src/modules/research-revisions/dto/create-revision.dto.ts`

```typescript
@IsOptional()
@IsObject()
original_data?: {
  abstract?: string;
  keywords?: string[];
  file_url?: string;
};
```

#### Migration:
**الملف:** `/apps/backend/src/database/migrations/add-original-data-to-revisions.ts`

```typescript
await queryRunner.addColumn('research_revisions', {
  name: 'original_data',
  type: 'jsonb',
  isNullable: true,
});
```

### 2. Frontend

#### Service:
**الملف:** `/apps/frontend/src/services/research-revisions.service.ts`

```typescript
export interface ResearchRevision {
  // ...
  original_data?: {
    abstract?: string;
    keywords?: string[];
    file_url?: string;
  };
}

export interface CreateRevisionDto {
  // ...
  original_data?: {
    abstract?: string;
    keywords?: string[];
    file_url?: string;
  };
}
```

#### PendingDecisionPage:
**الملف:** `/apps/frontend/src/pages/dashboard/PendingDecisionPage.tsx`

```typescript
// حفظ البيانات الأصلية عند طلب التعديل
const currentResearch = await researchService.getById(id);

await researchRevisionsService.create({
  research_id: id,
  revision_notes: editorNotes,
  original_data: {
    abstract: currentResearch.abstract,
    keywords: currentResearch.keywords,
    file_url: currentResearch.file_url,
  },
});
```

#### EvaluationFormPage:
**الملف:** `/apps/frontend/src/pages/dashboard/EvaluationFormPage.tsx`

```tsx
{/* عرض المقارنة */}
<div className="grid grid-cols-2 gap-4">
  {/* الملخص الأصلي */}
  <div className="bg-red-50">
    <h4>✖ الملخص الأصلي</h4>
    <p className="line-through opacity-75">
      {revision.original_data?.abstract}
    </p>
  </div>
  
  {/* الملخص المعدل */}
  <div className="bg-green-50">
    <h4>✔ الملخص المعدل</h4>
    <p>{research.abstract}</p>
  </div>
</div>
```

## 🎨 واجهة المستخدم

### قسم المقارنة في صفحة التقييم:

```
┌────────────────────────────────────────────────────────────┐
│ مقارنة البيانات                                           │
├────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐  ┌─────────────────────────┐   │
│ │ 🔴 ✖ الملخص الأصلي     │  │ 🟢 ✔ الملخص المعدل     │   │
│ │ ─────────────────────── │  │                         │   │
│ │ هذا البحث يتناول...    │  │ هذا البحث المحسن       │   │
│ │ (مشطوب وباهت)          │  │ يتناول بشكل مفصل...    │   │
│ └─────────────────────────┘  └─────────────────────────┘   │
│                                                            │
│ ┌─────────────────────────┐  ┌─────────────────────────┐   │
│ │ 🔴 ✖ الكلمات الأصلية   │  │ 🟢 ✔ الكلمات المعدلة   │   │
│ │ ─────────────────────── │  │                         │   │
│ │ 🏷️ AI (مشطوب)          │  │ 🏷️ ذكاء اصطناعي       │   │
│ │ 🏷️ تعليم (مشطوب)       │  │ 🏷️ تعليم              │   │
│ │                         │  │ 🏷️ تقنية (جديد)        │   │
│ └─────────────────────────┘  └─────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## 💡 المميزات

### للمحكم:
- ✅ **رؤية واضحة للتغييرات**: يرى بالضبط ما تم تعديله
- ✅ **مقارنة سهلة**: القديم والجديد جنباً إلى جنب
- ✅ **تمييز بصري**: ألوان مختلفة (أحمر للقديم، أخضر للجديد)
- ✅ **نص مشطوب**: القديم يظهر مشطوباً وباهتاً

### للنظام:
- ✅ **حفظ التاريخ**: جميع النسخ محفوظة
- ✅ **شفافية كاملة**: لا شيء يُحذف
- ✅ **تتبع التغييرات**: كل تعديل موثق

## 🧪 الاختبار

### خطوات الاختبار:

```sql
-- 1. إنشاء بحث
INSERT INTO research (abstract, keywords) 
VALUES ('ملخص أصلي', '["كلمة1", "كلمة2"]');

-- 2. طلب تعديل
INSERT INTO research_revisions (original_data) 
VALUES ('{
  "abstract": "ملخص أصلي",
  "keywords": ["كلمة1", "كلمة2"]
}');

-- 3. تعديل البحث
UPDATE research 
SET abstract = 'ملخص معدل', 
    keywords = '["كلمة1", "كلمة2", "كلمة3"]';

-- 4. التحقق من المقارنة
SELECT 
  r.abstract as current_abstract,
  rr.original_data->>'abstract' as original_abstract,
  r.keywords as current_keywords,
  rr.original_data->>'keywords' as original_keywords
FROM research r
JOIN research_revisions rr ON r.id = rr.research_id;

-- النتيجة:
-- current_abstract: "ملخص معدل"
-- original_abstract: "ملخص أصلي"
-- current_keywords: ["كلمة1", "كلمة2", "كلمة3"]
-- original_keywords: ["كلمة1", "كلمة2"]
```

## 📊 أمثلة الاستخدام

### مثال 1: تعديل الملخص فقط

```
الأصلي: "بحث يتناول الذكاء الاصطناعي"
المعدل: "بحث شامل يتناول تطبيقات الذكاء الاصطناعي في التعليم"

العرض:
┌──────────────────────────┐  ┌──────────────────────────┐
│ ✖ الأصلي                │  │ ✔ المعدل                │
│ بحث يتناول الذكاء...    │  │ بحث شامل يتناول...      │
└──────────────────────────┘  └──────────────────────────┘
```

### مثال 2: إضافة كلمات مفتاحية

```
الأصلي: ["AI", "تعليم"]
المعدل: ["ذكاء اصطناعي", "تعليم", "تقنية", "تطبيقات"]

العرض:
┌──────────────────────────┐  ┌──────────────────────────┐
│ ✖ الأصلي                │  │ ✔ المعدل                │
│ 🏷️ AI                   │  │ 🏷️ ذكاء اصطناعي        │
│ 🏷️ تعليم               │  │ 🏷️ تعليم               │
│                          │  │ 🏷️ تقنية (جديد)        │
│                          │  │ 🏷️ تطبيقات (جديد)      │
└──────────────────────────┘  └──────────────────────────┘
```

### مثال 3: تعديلات متعددة

```
التعديل #1:
  original_data: {abstract: "v1", keywords: ["k1"]}
  
التعديل #2:
  original_data: {abstract: "v2", keywords: ["k1", "k2"]}
  
التعديل #3:
  original_data: {abstract: "v3", keywords: ["k1", "k2", "k3"]}

كل تعديل يحفظ البيانات قبله!
```

## ✅ الخلاصة

### ما تم إنجازه:

1. ✅ إضافة حقل `original_data` إلى `research_revisions`
2. ✅ حفظ البيانات الأصلية عند طلب التعديل
3. ✅ عرض المقارنة بين القديم والجديد
4. ✅ تمييز بصري واضح (أحمر/أخضر، مشطوب/عادي)

### الآن المحكم يرى:

- 📄 **الملخص الأصلي** (مشطوب وباهت)
- 📄 **الملخص المعدل** (واضح وبارز)
- 🏷️ **الكلمات الأصلية** (مشطوبة)
- 🏷️ **الكلمات المعدلة** (واضحة)
- 📊 **مقارنة جنباً إلى جنب**

**البيانات الأصلية الآن محفوظة ويمكن عرضها للمقارنة!** ✅

---

**تم التطوير بواسطة:** Cascade AI  
**التاريخ:** 2024  
**الإصدار:** 1.0.0
