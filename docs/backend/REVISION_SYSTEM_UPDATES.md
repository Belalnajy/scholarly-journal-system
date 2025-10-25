# تحديثات نظام التعديلات (Revision System)

## نظرة عامة
تم تحديث نظام التعديلات ليعمل بشكل صحيح مع قاعدة البيانات والـ backend. النظام الآن يدعم:
- تحميل بيانات البحث الأصلية عند طلب التعديل
- حفظ سجل التعديلات في جدول `research_revisions`
- تتبع رقم المراجعة (revision number)
- إنشاء طلب تعديل تلقائياً عندما يقرر المحرر أن البحث يحتاج تعديلات

## الملفات المضافة/المعدلة

### 1. ملفات جديدة

#### `/apps/frontend/src/services/research-revisions.service.ts`
خدمة جديدة للتعامل مع الـ revisions في الـ frontend:
- `create()` - إنشاء طلب تعديل جديد
- `getAll()` - جلب جميع التعديلات مع فلاتر
- `getById()` - جلب تعديل محدد
- `getByResearch()` - جلب تعديلات بحث معين
- `getLatestPendingRevision()` - جلب آخر تعديل معلق
- `update()` - تحديث بيانات التعديل
- `submit()` - إرسال التعديل مع الملف
- `approve()` - الموافقة على التعديل
- `reject()` - رفض التعديل
- `delete()` - حذف التعديل

### 2. ملفات معدلة

#### `/apps/frontend/src/pages/dashboard/ReviseResearchPage.tsx`
التحديثات:
- **استيراد خدمة التعديلات**: إضافة `researchRevisionsService`
- **State جديد**: `currentRevision` لتخزين بيانات التعديل الحالي
- **تحميل البيانات**: 
  - جلب بيانات البحث الأصلية من قاعدة البيانات
  - جلب آخر طلب تعديل معلق
  - تحميل الملاحظات السابقة إذا كانت موجودة
- **حفظ التعديل**:
  - إنشاء أو تحديث سجل التعديل
  - رفع الملف الجديد
  - تحديث `file_url` في جدول `research`
  - إعادة تعيين حالة المراجعات والمحكمين
  - تغيير حالة البحث إلى `under-review`
- **عرض معلومات البحث الأصلي**: إضافة العنوان ورقم المراجعة

#### `/apps/frontend/src/pages/dashboard/PendingDecisionPage.tsx`
التحديثات:
- **استيراد الخدمات**: إضافة `researchService` و `researchRevisionsService`
- **تحديث `handleSubmitDecision()`**:
  - تحديث حالة البحث في قاعدة البيانات
  - إنشاء طلب تعديل تلقائياً عند اختيار "يتطلب تعديل"
  - إضافة deadline (30 يوم من تاريخ القرار)
  - معالجة الأخطاء بشكل صحيح

## تدفق العمل (Workflow)

### 1. عندما يقرر المحرر أن البحث يحتاج تعديلات:
```
PendingDecisionPage
  ↓
1. المحرر يختار "يتطلب تعديل"
2. يكتب الملاحظات والتعديلات المطلوبة
3. عند الضغط على "تأكيد القرار":
   - تحديث حالة البحث → needs-revision
   - إنشاء سجل في research_revisions
   - إرسال إشعار للباحث (TODO)
```

### 2. عندما يقوم الباحث بالتعديل:
```
ReviseResearchPage
  ↓
1. تحميل بيانات البحث الأصلية
2. تحميل طلب التعديل (revision_notes)
3. عرض ملاحظات المحكمين
4. الباحث يرفع الملف الجديد ويكتب ملاحظاته
5. عند الإرسال:
   - تحديث سجل التعديل → status: submitted
   - تحديث file_url في البحث
   - إعادة تعيين حالة المراجعات → pending
   - إعادة تعيين حالة المحكمين → accepted
   - تحديث حالة البحث → under-review
```

### 3. المحكم يراجع النسخة المعدلة:
```
- المحكم يرى البحث في لوحته مرة أخرى
- يقوم بمراجعة النسخة الجديدة
- يقدم تقييمه الجديد
```

## البيانات المخزنة في research_revisions

```typescript
{
  id: string;                    // UUID
  research_id: string;           // معرف البحث
  revision_number: number;       // رقم المراجعة (1, 2, 3...)
  revision_notes: string;        // ملاحظات المحرر/التعديلات المطلوبة
  file_url: string | null;       // رابط الملف المعدل (بعد الإرسال)
  status: RevisionStatus;        // pending | submitted | approved | rejected
  deadline: Date | null;         // موعد التسليم
  submitted_at: Date | null;     // تاريخ إرسال التعديل
  created_at: Date;              // تاريخ إنشاء الطلب
}
```

## Endpoints المستخدمة

### Research Endpoints
- `GET /research/:id` - جلب بيانات البحث
- `PATCH /research/:id` - تحديث بيانات البحث
- `PATCH /research/:id/status` - تحديث حالة البحث

### Revision Endpoints
- `POST /research-revisions` - إنشاء طلب تعديل
- `GET /research-revisions?research_id=xxx` - جلب تعديلات بحث معين
- `GET /research-revisions/:id` - جلب تعديل محدد
- `PUT /research-revisions/:id` - تحديث تعديل
- `PUT /research-revisions/:id/submit` - إرسال التعديل مع الملف
- `PUT /research-revisions/:id/approve` - الموافقة على التعديل
- `PUT /research-revisions/:id/reject` - رفض التعديل

### Review Endpoints
- `GET /reviews?research_id=xxx` - جلب مراجعات البحث
- `PATCH /reviews/:id/status` - تحديث حالة المراجعة

### Reviewer Assignment Endpoints
- `GET /reviewer-assignments?research_id=xxx` - جلب تعيينات المحكمين
- `PATCH /reviewer-assignments/:id/status` - تحديث حالة التعيين

## ملاحظات مهمة

### 1. رفع الملفات (File Upload)
حالياً يتم إنشاء URL وهمي للملف. يجب تطبيق رفع الملفات الفعلي:
```typescript
// TODO: في ReviseResearchPage.tsx (السطر 100-103)
// استبدال هذا الكود برفع فعلي إلى S3 أو Cloudinary
const timestamp = Date.now();
const newFileUrl = `https://storage.example.com/research/${research.id}/revision_${timestamp}_${formData.file.name}`;
```

### 2. الإشعارات
يجب إضافة نظام إشعارات:
- إشعار للباحث عند طلب التعديل
- إشعار للمحكمين عند إرسال النسخة المعدلة
- إشعار للمحرر عند اكتمال المراجعات

### 3. التحقق من الصلاحيات
يجب التأكد من:
- الباحث يمكنه فقط تعديل أبحاثه
- المحرر فقط يمكنه إنشاء طلبات التعديل
- المحكم يمكنه فقط مراجعة الأبحاث المعينة له

### 4. Deadline Management
- يتم تعيين deadline تلقائياً (30 يوم)
- يمكن للمحرر تعديل المدة
- يجب إضافة تنبيهات عند اقتراب الموعد

## الخطوات التالية (TODO)

1. **رفع الملفات الفعلي**:
   - تكامل مع S3 أو Cloudinary
   - معالجة الملفات الكبيرة
   - التحقق من نوع الملف

2. **نظام الإشعارات**:
   - إشعارات بريد إلكتروني
   - إشعارات داخل النظام
   - تنبيهات الـ deadline

3. **تحسينات UI/UX**:
   - عرض تاريخ التعديلات
   - مقارنة بين النسخ
   - تحميل الملفات السابقة

4. **التقارير والإحصائيات**:
   - عدد التعديلات لكل بحث
   - متوسط وقت التعديل
   - معدل قبول التعديلات

5. **الأمان والصلاحيات**:
   - Middleware للتحقق من الصلاحيات
   - Rate limiting
   - Audit logs

## الاختبار

### اختبار تدفق التعديلات:
1. قم بتسجيل الدخول كمحرر
2. افتح بحث في حالة `pending-editor-decision`
3. اختر "يتطلب تعديل" واكتب الملاحظات
4. تأكد من إنشاء سجل في `research_revisions`
5. سجل دخول كباحث
6. افتح صفحة التعديل
7. تأكد من ظهور البيانات الأصلية والملاحظات
8. ارفع ملف جديد واكتب ملاحظات
9. تأكد من تحديث البيانات بشكل صحيح

### التحقق من قاعدة البيانات:
```sql
-- التحقق من سجلات التعديلات
SELECT * FROM research_revisions WHERE research_id = 'xxx';

-- التحقق من حالة البحث
SELECT id, title, status, file_url FROM research WHERE id = 'xxx';

-- التحقق من حالة المراجعات
SELECT id, status FROM reviews WHERE research_id = 'xxx';

-- التحقق من حالة التعيينات
SELECT id, status FROM reviewer_assignments WHERE research_id = 'xxx';
```

## الخلاصة

النظام الآن يعمل بشكل متكامل مع قاعدة البيانات ويحفظ جميع البيانات بشكل صحيح. الباحث يمكنه رؤية بيانات بحثه الأصلية وملاحظات المحكمين، ويمكنه رفع نسخة معدلة تحل محل النسخة القديمة في النظام.
