# دليل اختبار نظام التعديلات

## 🧪 خطوات الاختبار

### المتطلبات الأولية
1. تأكد من تشغيل الـ backend: `npm run dev` في مجلد `apps/backend`
2. تأكد من تشغيل الـ frontend: `npm run dev` في مجلد `apps/frontend`
3. تأكد من وجود بيانات تجريبية في قاعدة البيانات

---

## 📋 سيناريو الاختبار الكامل

### الخطوة 1: إنشاء بحث جديد (كباحث)
```
1. سجل دخول كباحث
2. اذهب إلى "تقديم بحث جديد"
3. املأ البيانات:
   - العنوان: "تطبيقات الذكاء الاصطناعي في التعليم"
   - التخصص: "تقنية المعلومات"
   - الملخص: "بحث يتناول..."
   - ارفع ملف PDF
4. اضغط "تقديم البحث"
5. سجل رقم البحث (مثلاً: RES-2024-0001)
```

### الخطوة 2: تعيين محكمين (كمحرر)
```
1. سجل دخول كمحرر
2. اذهب إلى "إدارة الأبحاث"
3. ابحث عن البحث المقدم
4. اضغط "تعيين محكمين"
5. اختر محكمين (على الأقل 2)
6. اضغط "تعيين"
```

### الخطوة 3: المحكمون يقيمون البحث
```
1. سجل دخول كمحكم أول
2. اذهب إلى "طلبات التحكيم"
3. افتح البحث
4. املأ نموذج التقييم:
   - التقييم: 3.5/5
   - التوصية: "يحتاج تعديلات"
   - الملاحظات: "يجب تحسين المنهجية وإضافة مراجع"
5. اضغط "إرسال التقييم"

6. كرر نفس الخطوات للمحكم الثاني
```

### الخطوة 4: المحرر يطلب تعديلات ⭐
```
1. سجل دخول كمحرر
2. اذهب إلى "إدارة الأبحاث"
3. ابحث عن البحث (الحالة: pending-editor-decision)
4. اضغط "اتخاذ القرار"
5. راجع تقييمات المحكمين
6. اضغط "اتخاذ القرار الآن"
7. اختر "يتطلب تعديل"
8. اكتب في ملاحظات المحرر:
   """
   بناءً على تقييمات المحكمين، يرجى إجراء التعديلات التالية:
   
   1. تحسين المنهجية البحثية وتوضيح خطوات الدراسة
   2. إضافة مراجع حديثة (آخر 5 سنوات)
   3. توضيح النتائج بشكل أفضل مع إضافة جداول
   4. مراجعة الأخطاء اللغوية
   
   الموعد النهائي: 30 يوم من تاريخ اليوم
   """
9. اضغط "تأكيد القرار النهائي"
```

**✅ التحقق من قاعدة البيانات:**
```sql
-- يجب أن ترى سجل جديد في research_revisions
SELECT * FROM research_revisions 
WHERE research_id = 'xxx' 
ORDER BY created_at DESC LIMIT 1;

-- يجب أن تكون:
-- revision_number: 1
-- status: pending
-- revision_notes: "بناءً على تقييمات المحكمين..."
-- deadline: تاريخ بعد 30 يوم

-- حالة البحث يجب أن تكون needs-revision
SELECT status FROM research WHERE id = 'xxx';
```

### الخطوة 5: الباحث يعدل البحث ⭐⭐⭐
```
1. سجل دخول كباحث
2. اذهب إلى "أبحاثي"
3. يجب أن ترى البحث بحالة "يحتاج تعديلات"
4. اضغط على البحث أو "تعديل"
5. يجب أن ترى:
   ✅ عنوان البحث الأصلي
   ✅ رقم البحث
   ✅ التخصص
   ✅ تاريخ التقديم
   ✅ رقم المراجعة: #1
   ✅ ملاحظات المحكمين الكاملة
   ✅ ملاحظات المحرر (التعديلات المطلوبة)
   
6. في قسم "ملاحظات الباحث" اكتب:
   """
   تم إجراء التعديلات التالية:
   
   1. ✅ تم تحسين المنهجية وإضافة خطوات تفصيلية
   2. ✅ تم إضافة 15 مرجع حديث (2020-2024)
   3. ✅ تم إضافة 3 جداول توضيحية للنتائج
   4. ✅ تم مراجعة النص لغوياً
   """
   
7. ارفع ملف PDF جديد (النسخة المعدلة)
8. اضغط "إرسال النسخة المعدلة"
9. يجب أن ترى رسالة نجاح
```

**✅ التحقق من قاعدة البيانات:**
```sql
-- سجل التعديل يجب أن يكون submitted
SELECT status, file_url, submitted_at 
FROM research_revisions 
WHERE research_id = 'xxx';
-- status: submitted
-- file_url: رابط الملف الجديد
-- submitted_at: الوقت الحالي

-- رابط الملف في جدول research يجب أن يتحدث
SELECT file_url, status FROM research WHERE id = 'xxx';
-- file_url: نفس الرابط الجديد
-- status: under-review

-- حالة المراجعات يجب أن تعود pending
SELECT id, status FROM reviews WHERE research_id = 'xxx';
-- جميع المراجعات: status = pending

-- حالة التعيينات يجب أن تعود accepted
SELECT id, status FROM reviewer_assignments WHERE research_id = 'xxx';
-- جميع التعيينات: status = accepted
```

### الخطوة 6: المحكمون يراجعون النسخة المعدلة
```
1. سجل دخول كمحكم
2. اذهب إلى "طلبات التحكيم"
3. يجب أن ترى البحث مرة أخرى
4. افتح البحث (يجب أن يكون الملف الجديد)
5. قيم النسخة المعدلة
6. اضغط "إرسال التقييم"
```

### الخطوة 7: المحرر يتخذ القرار النهائي
```
1. بعد اكتمال تقييمات المحكمين
2. المحرر يراجع التقييمات الجديدة
3. يتخذ القرار النهائي (قبول/رفض/تعديل مرة أخرى)
```

---

## 🔍 نقاط التحقق الرئيسية

### ✅ في صفحة ReviseResearchPage

**يجب أن ترى:**
- [ ] عنوان البحث الأصلي في الأعلى
- [ ] بانر أصفر يوضح أن البحث يحتاج تعديلات
- [ ] قسم "ملاحظات المحكمين" مع جميع التقييمات
- [ ] اسم كل محكم وتقييمه
- [ ] توصية كل محكم (قبول/رفض/تعديل)
- [ ] ملاحظات كل محكم
- [ ] قسم "رفع النسخة المعدلة"
- [ ] حقل "ملاحظات الباحث" (مطلوب)
- [ ] منطقة رفع ملف PDF (مطلوب)
- [ ] قسم "معلومات البحث الأصلي" يحتوي على:
  - رقم البحث
  - العنوان
  - التخصص
  - تاريخ التقديم
  - رقم المراجعة (#1)

**يجب ألا ترى:**
- [ ] حقول لتعديل العنوان أو التخصص (البيانات الأصلية ثابتة)
- [ ] أخطاء في التحميل
- [ ] بيانات فارغة

### ✅ في قاعدة البيانات

**جدول research_revisions:**
```sql
-- عند إنشاء طلب التعديل
revision_number: 1
status: 'pending'
revision_notes: 'ملاحظات المحرر'
file_url: null
deadline: تاريخ مستقبلي
submitted_at: null

-- بعد إرسال التعديل
status: 'submitted'
file_url: 'رابط الملف الجديد'
submitted_at: الوقت الحالي
```

**جدول research:**
```sql
-- بعد إرسال التعديل
file_url: 'رابط الملف الجديد' (محدث)
status: 'under-review' (محدث)
updated_at: الوقت الحالي (محدث تلقائياً)
```

**جدول reviews:**
```sql
-- جميع المراجعات المكتملة تعود pending
status: 'pending'
```

**جدول reviewer_assignments:**
```sql
-- جميع التعيينات المكتملة تعود accepted
status: 'accepted'
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر بيانات البحث
**الحل:**
1. تحقق من console في المتصفح
2. تحقق من أن البحث موجود في قاعدة البيانات
3. تحقق من أن الـ API يعمل: `GET /research/:id`

### المشكلة: لا تظهر ملاحظات المحكمين
**الحل:**
1. تحقق من وجود reviews في قاعدة البيانات
2. تحقق من أن status = 'completed'
3. تحقق من الـ API: `GET /reviews?research_id=xxx`

### المشكلة: خطأ عند إرسال التعديل
**الحل:**
1. تحقق من console في المتصفح
2. تحقق من أن جميع الحقول مملوءة
3. تحقق من أن الملف PDF صحيح
4. تحقق من logs الـ backend

### المشكلة: لا يتم تحديث file_url
**الحل:**
1. تحقق من أن endpoint `/research/:id` يعمل
2. تحقق من أن الـ DTO يسمح بتحديث file_url
3. راجع الكود في `handleSubmit` في ReviseResearchPage

---

## 📊 استعلامات SQL مفيدة

### عرض جميع التعديلات لبحث معين
```sql
SELECT 
  rr.revision_number,
  rr.status,
  rr.revision_notes,
  rr.file_url,
  rr.deadline,
  rr.submitted_at,
  rr.created_at
FROM research_revisions rr
WHERE rr.research_id = 'xxx'
ORDER BY rr.revision_number DESC;
```

### عرض حالة البحث مع آخر تعديل
```sql
SELECT 
  r.research_number,
  r.title,
  r.status as research_status,
  r.file_url as current_file,
  rr.revision_number,
  rr.status as revision_status,
  rr.submitted_at
FROM research r
LEFT JOIN research_revisions rr ON r.id = rr.research_id
WHERE r.id = 'xxx'
ORDER BY rr.revision_number DESC
LIMIT 1;
```

### عرض جميع المراجعات مع حالتها
```sql
SELECT 
  rv.id,
  rv.status,
  rv.general_comments,
  rv.recommendation,
  u.name as reviewer_name
FROM reviews rv
JOIN users u ON rv.reviewer_id = u.id
WHERE rv.research_id = 'xxx';
```

### عرض تاريخ البحث الكامل
```sql
-- البحث الأصلي
SELECT 'Research Created' as event, created_at as date FROM research WHERE id = 'xxx'
UNION ALL
-- التعديلات
SELECT CONCAT('Revision #', revision_number, ' - ', status), created_at FROM research_revisions WHERE research_id = 'xxx'
UNION ALL
-- المراجعات
SELECT CONCAT('Review by ', reviewer_id, ' - ', status), created_at FROM reviews WHERE research_id = 'xxx'
ORDER BY date;
```

---

## ✅ قائمة التحقق النهائية

قبل اعتبار النظام جاهز، تأكد من:

### Frontend
- [ ] صفحة ReviseResearchPage تحمل البيانات بشكل صحيح
- [ ] تظهر جميع ملاحظات المحكمين
- [ ] يمكن رفع ملف PDF جديد
- [ ] يمكن كتابة ملاحظات الباحث
- [ ] يتم الإرسال بنجاح
- [ ] تظهر رسالة نجاح
- [ ] يتم التوجيه إلى صفحة "أبحاثي"

### Backend
- [ ] endpoint `POST /research-revisions` يعمل
- [ ] endpoint `GET /research-revisions?research_id=xxx` يعمل
- [ ] endpoint `PUT /research-revisions/:id/submit` يعمل
- [ ] endpoint `PATCH /research/:id` يعمل
- [ ] endpoint `PATCH /research/:id/status` يعمل
- [ ] endpoint `PATCH /reviews/:id/status` يعمل
- [ ] endpoint `PATCH /reviewer-assignments/:id/status` يعمل

### Database
- [ ] يتم إنشاء سجل في research_revisions
- [ ] revision_number يزيد تلقائياً
- [ ] يتم تحديث file_url في research
- [ ] يتم تحديث status في research
- [ ] يتم إعادة تعيين reviews إلى pending
- [ ] يتم إعادة تعيين assignments إلى accepted

---

## 🎉 النجاح!

إذا نجحت جميع الخطوات أعلاه، فإن نظام التعديلات يعمل بشكل صحيح! 🎊

الباحث الآن يمكنه:
- ✅ رؤية بيانات بحثه الأصلية
- ✅ قراءة ملاحظات المحكمين
- ✅ رفع نسخة معدلة
- ✅ تتبع رقم المراجعة
- ✅ إرسال التعديل للمراجعة مرة أخرى
