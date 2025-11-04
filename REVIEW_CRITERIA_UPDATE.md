# تحديث معايير التحكيم - Review Criteria Update

## التاريخ: 2025-11-04

تم تحديث معايير التحكيم في النظام لتتوافق مع المعايير الأكاديمية الجديدة.

## المعايير الجديدة (من 100 درجة)

| المعيار | الدرجة |
|---------|--------|
| العنوان | 3 |
| مستخلص البحث | 2 |
| منهج الرسالة | 15 |
| أدبيات الرسالة | 15 |
| نتائج البحث وتوصياته | 15 |
| التوثيق العلمي | 15 |
| الأصالة والابتكار | 15 |
| إخراج البحث | 2 |
| حالة البحث | 10 |
| المصادر والمراجع | 8 |
| **المجموع** | **100** |

## التغييرات التي تمت

### 1. Frontend Updates

#### ✅ EvaluationFormPage.tsx
- تحديث معايير التحكيم في نموذج التقييم
- تعديل الدرجات القصوى لكل معيار
- تحديث أسماء المعايير

#### ✅ EditorReviewDetailsPage.tsx
- تحديث عرض التقييمات التفصيلية
- تحديث حساب متوسط الدرجات
- تعديل أسماء المعايير في العرض

#### ✅ PendingRevisionDetailsPage.tsx
- تحديث عرض التقييمات في صفحة التعديلات المعلقة
- مزامنة المعايير مع باقي الصفحات

### 2. Backend Updates

#### ✅ review.entity.ts
- تحديث تعليقات الحقول في Entity
- تحديث أسماء الحقول في `detailed_scores`
- مزامنة الدرجات القصوى

#### ✅ create-review.dto.ts
- تحديث أسماء الحقول في DTO
- مزامنة مع Entity

#### ✅ Migration: 1730920000000-UpdateReviewCriteriaScoring.ts
- إضافة migration توثيقي للتحديثات
- تحديث تعليقات قاعدة البيانات

## البنية التقنية

### detailed_scores Structure
```typescript
{
  title_score?: number;           // 3 درجات
  abstract_score?: number;        // 2 درجة
  methodology_score?: number;     // 15 درجة
  background_score?: number;      // 15 درجة
  results_score?: number;         // 15 درجة
  documentation_score?: number;   // 15 درجة
  originality_score?: number;     // 15 درجة
  formatting_score?: number;      // 2 درجة
  research_condition_score?: number; // 10 درجات
  sources_score?: number;         // 8 درجات
}
```

## التوافق مع الإصدارات السابقة

- النظام يدعم التقييمات القديمة والجديدة
- الحقل `detailed_scores` من نوع JSONB مما يسمح بالمرونة
- التقييمات القديمة ستظل تعمل بدون مشاكل

## خطوات التطبيق

1. ✅ تحديث Frontend Components
2. ✅ تحديث Backend Entities & DTOs
3. ✅ إنشاء Migration
4. ⏳ تشغيل Migration على قاعدة البيانات

## ملاحظات مهمة

- المجموع الكلي يبقى 100 درجة
- جميع التقييمات الجديدة ستستخدم المعايير المحدثة
- التقييمات السابقة لن تتأثر
- يمكن للمحكمين استخدام النظام مباشرة بعد التحديث

## الخطوات التالية

لتطبيق التحديثات على قاعدة البيانات، قم بتشغيل:

```bash
cd apps/backend
npm run migration:run
```

أو إذا كنت تستخدم Nx:

```bash
nx run backend:migration:run
```
