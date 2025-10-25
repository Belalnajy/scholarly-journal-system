# نظام التعديلات - دليل شامل

## 📌 نظرة عامة

تم تطوير نظام متكامل لإدارة تعديلات الأبحاث العلمية، يسمح للباحثين بتعديل أبحاثهم بناءً على ملاحظات المحكمين والمحررين.

## 🎯 المشكلة التي تم حلها

**قبل التحديث:**
- الباحث لا يرى بيانات بحثه الأصلية عند التعديل
- لا يوجد نظام لتتبع التعديلات
- الملف الجديد لا يحل محل القديم بشكل صحيح
- لا يتم حفظ سجل التعديلات في قاعدة البيانات

**بعد التحديث:**
- ✅ الباحث يرى جميع بيانات بحثه الأصلية
- ✅ نظام متكامل لتتبع التعديلات مع أرقام المراجعات
- ✅ الملف الجديد يحل محل القديم تلقائياً
- ✅ جميع التعديلات محفوظة في قاعدة البيانات

## 📁 الملفات المضافة/المعدلة

### ملفات جديدة
1. **`/apps/frontend/src/services/research-revisions.service.ts`**
   - خدمة كاملة للتعامل مع التعديلات
   - جميع العمليات CRUD
   - تكامل مع الـ backend

### ملفات معدلة
1. **`/apps/frontend/src/pages/dashboard/ReviseResearchPage.tsx`**
   - تحميل البيانات الأصلية من قاعدة البيانات
   - عرض ملاحظات المحكمين
   - نظام رفع الملفات المحسن
   - حفظ التعديلات في قاعدة البيانات

2. **`/apps/frontend/src/pages/dashboard/PendingDecisionPage.tsx`**
   - إنشاء طلب تعديل تلقائي
   - تكامل مع نظام التعديلات
   - حفظ ملاحظات المحرر

### ملفات توثيق
1. **`REVISION_SYSTEM_UPDATES.md`** - شرح تفصيلي للتحديثات
2. **`REVISION_SUMMARY_AR.md`** - ملخص بالعربية
3. **`TESTING_GUIDE_AR.md`** - دليل الاختبار
4. **`REVISION_SYSTEM_README.md`** - هذا الملف

## 🔄 تدفق العمل

```
┌─────────────────────────────────────────────────────────────┐
│ 1. المحرر يطلب تعديلات                                     │
│    - يراجع تقييمات المحكمين                                 │
│    - يختار "يتطلب تعديل"                                   │
│    - يكتب التعديلات المطلوبة                               │
│    - يتم إنشاء سجل في research_revisions                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. الباحث يعدل البحث                                       │
│    - يفتح صفحة التعديل                                     │
│    - يرى بيانات بحثه الأصلية                              │
│    - يرى ملاحظات المحكمين والتعديلات المطلوبة             │
│    - يرفع ملف PDF جديد                                     │
│    - يكتب ملاحظاته حول التعديلات                          │
│    - يرسل النسخة المعدلة                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. النظام يحدث البيانات تلقائياً                           │
│    - تحديث file_url في جدول research                       │
│    - تحديث حالة التعديل → submitted                        │
│    - إعادة تعيين المراجعات → pending                       │
│    - إعادة تعيين المحكمين → accepted                       │
│    - تحديث حالة البحث → under-review                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. المحكمون يراجعون النسخة المعدلة                         │
│    - يرون البحث في لوحتهم مرة أخرى                        │
│    - يراجعون النسخة الجديدة                                │
│    - يقدمون تقييماتهم                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. المحرر يتخذ القرار النهائي                              │
│    - قبول البحث للنشر                                      │
│    - أو طلب تعديلات إضافية (تكرار العملية)                │
│    - أو رفض البحث                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ قاعدة البيانات

### جدول research_revisions
```sql
CREATE TABLE research_revisions (
  id UUID PRIMARY KEY,
  research_id UUID REFERENCES research(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  revision_notes TEXT NOT NULL,
  file_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  deadline TIMESTAMP,
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### التحديثات على جدول research
```sql
-- عند إرسال التعديل، يتم تحديث:
UPDATE research 
SET 
  file_url = 'رابط الملف الجديد',
  status = 'under-review',
  updated_at = NOW()
WHERE id = 'xxx';
```

## 🔌 API Endpoints

### Research Revisions
```
POST   /research-revisions              إنشاء طلب تعديل
GET    /research-revisions              جلب جميع التعديلات
GET    /research-revisions/:id          جلب تعديل محدد
PUT    /research-revisions/:id          تحديث تعديل
PUT    /research-revisions/:id/submit   إرسال التعديل مع الملف
PUT    /research-revisions/:id/approve  الموافقة على التعديل
PUT    /research-revisions/:id/reject   رفض التعديل
DELETE /research-revisions/:id          حذف تعديل
```

### Research
```
GET    /research/:id                    جلب بيانات البحث
PATCH  /research/:id                    تحديث البحث
PATCH  /research/:id/status             تحديث حالة البحث
```

### Reviews & Assignments
```
GET    /reviews?research_id=xxx         جلب المراجعات
PATCH  /reviews/:id/status              تحديث حالة المراجعة
GET    /reviewer-assignments?research_id=xxx
PATCH  /reviewer-assignments/:id/status
```

## 💻 أمثلة الاستخدام

### إنشاء طلب تعديل (من المحرر)
```typescript
const revision = await researchRevisionsService.create({
  research_id: 'research-uuid',
  revision_notes: 'يرجى تحسين المنهجية وإضافة مراجع',
  deadline: '2024-03-15'
});
```

### جلب آخر تعديل معلق (للباحث)
```typescript
const revision = await researchRevisionsService.getLatestPendingRevision(
  'research-uuid'
);

if (revision) {
  console.log('التعديلات المطلوبة:', revision.revision_notes);
  console.log('رقم المراجعة:', revision.revision_number);
}
```

### إرسال التعديل (من الباحث)
```typescript
// 1. رفع الملف (TODO: تكامل مع S3)
const fileUrl = await uploadFile(file);

// 2. إرسال التعديل
await researchRevisionsService.submit(revisionId, fileUrl);

// 3. تحديث البحث
await researchService.update(researchId, {
  file_url: fileUrl
});

// 4. إعادة تعيين المراجعات
await resetReviewsAndAssignments(researchId);

// 5. تحديث حالة البحث
await researchService.updateStatus(researchId, 'under-review');
```

## 🎨 واجهة المستخدم

### صفحة التعديل (ReviseResearchPage)
```
┌────────────────────────────────────────────────────────────┐
│ تعديل البحث                                               │
│ تطبيقات الذكاء الاصطناعي في التعليم                      │
├────────────────────────────────────────────────────────────┤
│ 📋 البحث يحتاج إلى تعديلات بناءً على ملاحظات المحكمين   │
├────────────────────────────────────────────────────────────┤
│ ملاحظات المحكمين                                          │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 👤 د. محمد أحمد                    ⭐ 4.5/5         │   │
│ │ التوصية: يحتاج تعديلات                              │   │
│ │ الملاحظات: يجب تحسين المنهجية...                   │   │
│ └──────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ رفع النسخة المعدلة                                        │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ملاحظات الباحث *                                    │   │
│ │ [تم إجراء التعديلات التالية...]                    │   │
│ └──────────────────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📎 رفع ملف PDF *                                    │   │
│ │ [اسحب وأفلت الملف هنا]                             │   │
│ └──────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│ معلومات البحث الأصلي                                     │
│ رقم البحث: RES-2024-0001                                  │
│ العنوان: تطبيقات الذكاء الاصطناعي في التعليم             │
│ التخصص: تقنية المعلومات                                  │
│ رقم المراجعة: #1                                          │
├────────────────────────────────────────────────────────────┤
│ [إرسال النسخة المعدلة] [إلغاء]                            │
└────────────────────────────────────────────────────────────┘
```

## ⚙️ الإعدادات والتخصيص

### تغيير مدة الـ Deadline
في `PendingDecisionPage.tsx`:
```typescript
// حالياً: 30 يوم
deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

// لتغييرها إلى 45 يوم:
deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
```

### تخصيص رسائل النجاح
في `ReviseResearchPage.tsx`:
```typescript
alert('تم إرسال النسخة المعدلة بنجاح! سيتم مراجعتها من قبل نفس المحكمين.');
```

## 🔒 الأمان والصلاحيات

### التحقق من الصلاحيات (TODO)
```typescript
// في الـ backend، يجب إضافة:
@UseGuards(AuthGuard, RoleGuard)
@Roles('researcher')
async submitRevision(@Param('id') id: string, @User() user) {
  // التحقق من أن البحث يخص الباحث
  const revision = await this.revisionsService.findOne(id);
  if (revision.research.user_id !== user.id) {
    throw new ForbiddenException();
  }
  // ...
}
```

## 📊 الإحصائيات والتقارير (TODO)

### عدد التعديلات لكل بحث
```sql
SELECT 
  r.research_number,
  r.title,
  COUNT(rr.id) as revision_count
FROM research r
LEFT JOIN research_revisions rr ON r.id = rr.research_id
GROUP BY r.id
ORDER BY revision_count DESC;
```

### متوسط وقت التعديل
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (submitted_at - created_at))/86400) as avg_days
FROM research_revisions
WHERE status = 'submitted';
```

## 🚀 الخطوات التالية

### 1. رفع الملفات الفعلي
- [ ] تكامل مع AWS S3
- [ ] أو تكامل مع Cloudinary
- [ ] معالجة الملفات الكبيرة
- [ ] Progress bar

### 2. نظام الإشعارات
- [ ] إشعار بريد إلكتروني للباحث عند طلب التعديل
- [ ] إشعار للمحكمين عند إرسال النسخة المعدلة
- [ ] تنبيهات الـ deadline

### 3. تحسينات UI/UX
- [ ] عرض تاريخ جميع التعديلات
- [ ] مقارنة بين النسخ (diff viewer)
- [ ] تحميل النسخ السابقة
- [ ] معاينة PDF مباشرة

### 4. التقارير
- [ ] Dashboard للإحصائيات
- [ ] تقارير التعديلات
- [ ] معدلات القبول بعد التعديل

## 📚 الموارد

### الملفات المرجعية
- `REVISION_SYSTEM_UPDATES.md` - شرح تفصيلي للتحديثات
- `REVISION_SUMMARY_AR.md` - ملخص سريع بالعربية
- `TESTING_GUIDE_AR.md` - دليل الاختبار الكامل

### الكود المصدري
- `/apps/frontend/src/services/research-revisions.service.ts`
- `/apps/frontend/src/pages/dashboard/ReviseResearchPage.tsx`
- `/apps/frontend/src/pages/dashboard/PendingDecisionPage.tsx`
- `/apps/backend/src/modules/research-revisions/`

## 🤝 المساهمة

عند إضافة ميزات جديدة:
1. حدث الـ DTOs في الـ backend
2. حدث الـ service في الـ frontend
3. حدث الـ UI components
4. أضف tests
5. حدث التوثيق

## 📝 الملاحظات النهائية

- ✅ النظام يعمل بشكل متكامل مع قاعدة البيانات
- ✅ جميع البيانات محفوظة بشكل صحيح
- ✅ الملف الجديد يحل محل القديم
- ✅ تتبع كامل للتعديلات
- ⚠️ رفع الملفات يحتاج تكامل مع S3/Cloudinary
- ⚠️ الإشعارات تحتاج تطبيق
- ⚠️ الصلاحيات تحتاج تحسين

## 📞 الدعم

للأسئلة أو المشاكل:
1. راجع `TESTING_GUIDE_AR.md`
2. تحقق من console logs
3. راجع قاعدة البيانات
4. افحص network requests

---

**تم التطوير بواسطة:** Cascade AI  
**التاريخ:** 2024  
**الإصدار:** 1.0.0
