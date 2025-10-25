# تحديث التعديلات الموجودة لإضافة البيانات الأصلية

## 🎯 المشكلة

التعديلات التي تم إنشاؤها **قبل** إضافة حقل `original_data` لا تحتوي على البيانات الأصلية، لذلك قسم "مقارنة البيانات" يظهر "لا توجد بيانات أصلية محفوظة للمقارنة".

## ✅ الحل

### الخيار 1: تشغيل Migration (موصى به)

```bash
cd apps/backend
npm run migration:run
# أو
npm run typeorm migration:run
```

### الخيار 2: تحديث يدوي عبر SQL

```sql
-- عرض التعديلات بدون بيانات أصلية
SELECT 
  rr.id,
  rr.research_id,
  rr.revision_number,
  rr.original_data,
  r.abstract,
  r.keywords,
  r.file_url
FROM research_revisions rr
JOIN research r ON rr.research_id = r.id
WHERE rr.original_data IS NULL;

-- تحديث التعديلات بإضافة البيانات الأصلية
-- ⚠️ هذا مثال - يجب تعديله حسب البيانات الفعلية
UPDATE research_revisions rr
SET original_data = jsonb_build_object(
  'abstract', r.abstract,
  'keywords', r.keywords,
  'file_url', r.file_url
)
FROM research r
WHERE rr.research_id = r.id
  AND rr.original_data IS NULL;
```

### الخيار 3: إعادة إنشاء طلب التعديل

1. المحرر يذهب لصفحة القرار
2. يختار "رفض" ثم "قبول مع تعديلات" مرة أخرى
3. هذا سيحفظ البيانات الأصلية تلقائياً

### الخيار 4: API Endpoint لتحديث التعديلات

يمكن إنشاء endpoint خاص لتحديث التعديلات الموجودة:

```typescript
// في research-revisions.controller.ts
@Patch('fix-missing-original-data')
async fixMissingOriginalData() {
  const revisions = await this.researchRevisionsService.findAll();
  
  for (const revision of revisions) {
    if (!revision.original_data) {
      const research = await this.researchService.findOne(revision.research_id);
      
      await this.researchRevisionsService.update(revision.id, {
        original_data: {
          abstract: research.abstract,
          keywords: research.keywords,
          file_url: research.file_url,
        },
      });
    }
  }
  
  return { message: 'Fixed missing original data' };
}
```

## 🧪 التحقق

بعد التحديث، تحقق من البيانات:

```sql
-- عرض التعديلات مع البيانات الأصلية
SELECT 
  id,
  research_id,
  revision_number,
  original_data,
  status
FROM research_revisions
WHERE original_data IS NOT NULL;
```

## 📝 ملاحظات

### للتعديلات الجديدة:
✅ ستعمل تلقائياً - البيانات الأصلية تُحفظ عند إنشاء طلب التعديل

### للتعديلات القديمة:
⚠️ تحتاج تحديث يدوي أو migration

## 🎯 التوصية

**للإنتاج:**
- استخدم الخيار 1 (Migration)

**للتطوير:**
- استخدم الخيار 2 (SQL مباشر) أو الخيار 4 (API Endpoint)

---

**تم التوثيق بواسطة:** Cascade AI  
**التاريخ:** 2024
