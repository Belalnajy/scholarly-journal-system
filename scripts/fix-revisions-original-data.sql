-- ============================================
-- إصلاح التعديلات الموجودة بإضافة البيانات الأصلية
-- ============================================

-- 1. عرض التعديلات التي تحتاج إصلاح
SELECT 
  rr.id AS revision_id,
  rr.research_id,
  rr.revision_number,
  rr.status,
  rr.original_data,
  r.title AS research_title
FROM research_revisions rr
JOIN research r ON rr.research_id = r.id
WHERE rr.original_data IS NULL
ORDER BY rr.created_at DESC;

-- 2. تحديث التعديلات بإضافة البيانات الأصلية
-- ⚠️ هذا سيضيف البيانات الحالية كـ "أصلية" - قد لا تكون دقيقة 100%
UPDATE research_revisions rr
SET original_data = jsonb_build_object(
  'abstract', r.abstract,
  'keywords', r.keywords,
  'file_url', r.file_url
)
FROM research r
WHERE rr.research_id = r.id
  AND rr.original_data IS NULL;

-- 3. التحقق من النتيجة
SELECT 
  rr.id AS revision_id,
  rr.research_id,
  rr.revision_number,
  rr.status,
  rr.original_data->>'abstract' AS original_abstract,
  rr.original_data->>'keywords' AS original_keywords,
  r.abstract AS current_abstract,
  r.keywords AS current_keywords
FROM research_revisions rr
JOIN research r ON rr.research_id = r.id
WHERE rr.original_data IS NOT NULL
ORDER BY rr.created_at DESC;

-- ============================================
-- ملاحظات:
-- ============================================
-- 1. هذا السكريبت يضيف البيانات الحالية كـ "أصلية"
-- 2. إذا كان البحث قد تم تعديله بالفعل، فالبيانات قد لا تكون دقيقة
-- 3. للتعديلات الجديدة، سيتم حفظ البيانات الأصلية تلقائياً
-- ============================================
