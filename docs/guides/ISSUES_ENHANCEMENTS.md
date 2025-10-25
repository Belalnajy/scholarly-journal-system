# تحسينات نظام الأعداد (Issues Enhancements)

تم إضافة تحسينات جديدة لنظام إدارة الأعداد في المجلة العلمية.

## 📅 1. تاريخ النشر المخطط (Planned Publish Date)

### المفهوم:
- **تاريخ النشر المخطط** هو تاريخ تقديري للتخطيط والتذكير فقط
- عند **نشر العدد فعلياً**، يتحول التاريخ تلقائياً إلى **تاريخ النشر الفعلي**

### التنفيذ في Backend:

**ملف:** `/apps/backend/src/modules/issues/issues.service.ts`

```typescript
async publish(id: string): Promise<Issue> {
  const issue = await this.findOne(id);

  // Publish all articles
  if (issue.articles && issue.articles.length > 0) {
    const currentDate = new Date();
    for (const article of issue.articles) {
      if (article.status === 'ready-to-publish') {
        article.status = 'published' as any;
        article.published_date = currentDate;
      }
    }
    await this.issueRepository.manager.save(issue.articles);
  }

  // Update issue status and publish date
  if (issue.status !== IssueStatus.PUBLISHED) {
    issue.status = IssueStatus.PUBLISHED;
    issue.progress_percentage = 100;
    // ✅ تحديث تاريخ النشر إلى التاريخ الفعلي
    issue.publish_date = new Date();
    await this.issueRepository.save(issue);
  }

  return issue;
}
```

### التنفيذ في Frontend:

**1. صفحة إنشاء عدد جديد** (`ManageIssuesPage.tsx`):
```tsx
<input
  type="date"
  value={formData.publish_date}
  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
  required
/>
<p className="mt-2 text-xs text-gray-500 text-right">
  💡 للتخطيط فقط. عند النشر يتحول لتاريخ النشر الفعلي
</p>
```

**2. صفحة تحرير العدد** (`EditIssuePage.tsx`):
```tsx
<input
  type="date"
  value={formData.publish_date}
  onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
  required
/>
<p className="mt-2 text-xs text-gray-500">
  💡 هذا التاريخ للتخطيط فقط. عند النشر، سيتحول تلقائياً لتاريخ النشر الفعلي
</p>
```

### Workflow:
1. **إنشاء العدد**: المحرر يضع تاريخ نشر مخطط (مثلاً: 2024-12-31)
2. **التحضير**: العدد يبقى بحالة `planned` أو `in-progress`
3. **النشر**: عند الضغط على "نشر العدد"
   - يتحول `status` إلى `published`
   - يتحول `publish_date` إلى التاريخ الحالي (تاريخ النشر الفعلي)
   - تُنشر جميع المقالات في العدد

---

## 🎯 2. الحد الأقصى للمقالات (Max Articles Limit)

### المفهوم:
- كل عدد له **حد أقصى** لعدد المقالات التي يمكن إضافتها
- لا يمكن إضافة مقالات تتجاوز هذا الحد
- **لا يمكن تقليل الحد الأقصى** إلى أقل من عدد المقالات الموجودة بالفعل
- Validation في Backend و Frontend

### التنفيذ في Backend:

#### 1. منع إضافة مقالات تتجاوز الحد الأقصى

**ملف:** `/apps/backend/src/modules/articles/articles.service.ts`

```typescript
async create(createArticleDto: CreateArticleDto): Promise<Article> {
  // Check if article number already exists
  const existingArticle = await this.articleRepository.findOne({
    where: { article_number: createArticleDto.article_number },
  });

  if (existingArticle) {
    throw new ConflictException('رقم المقال موجود بالفعل');
  }

  // Verify issue exists and check max articles limit
  const issue = await this.issuesService.findOne(createArticleDto.issue_id);
  
  // ✅ التحقق من الحد الأقصى
  if (issue.total_articles >= issue.max_articles) {
    throw new BadRequestException(
      `لا يمكن إضافة المزيد من المقالات. الحد الأقصى للعدد هو ${issue.max_articles} مقال`,
    );
  }

  // ... rest of the code
}
```

#### 2. منع تقليل الحد الأقصى تحت عدد المقالات الحالية

**ملف:** `/apps/backend/src/modules/issues/issues.service.ts`

```typescript
async update(id: string, updateIssueDto: UpdateIssueDto): Promise<Issue> {
  const issue = await this.findOne(id);

  // Check if issue number is being changed and if it already exists
  if (
    updateIssueDto.issue_number &&
    updateIssueDto.issue_number !== issue.issue_number
  ) {
    const existingIssue = await this.issueRepository.findOne({
      where: { issue_number: updateIssueDto.issue_number },
    });

    if (existingIssue) {
      throw new ConflictException('رقم العدد موجود بالفعل');
    }
  }

  // ✅ التحقق من عدم تقليل الحد الأقصى تحت عدد المقالات الحالية
  if (
    updateIssueDto.max_articles !== undefined &&
    updateIssueDto.max_articles < issue.total_articles
  ) {
    throw new BadRequestException(
      `لا يمكن تقليل الحد الأقصى إلى ${updateIssueDto.max_articles} لأن العدد يحتوي بالفعل على ${issue.total_articles} مقال. يجب أن يكون الحد الأقصى ${issue.total_articles} على الأقل`,
    );
  }

  Object.assign(issue, updateIssueDto);
  return await this.issueRepository.save(issue);
}
```

### التنفيذ في Frontend:

**1. صفحة إضافة مقالات للعدد** (`AddArticleToIssuePage.tsx`):

#### عرض معلومات العدد:
```tsx
{issue && (
  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{issue.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📄 المقالات الحالية: <span className="font-bold">{issue.total_articles}</span></span>
          <span>🎯 الحد الأقصى: <span className="font-bold">{issue.max_articles}</span></span>
          <span>✅ المتبقي: <span className="font-bold text-green-600">{issue.max_articles - issue.total_articles}</span></span>
        </div>
      </div>
    </div>
  </div>
)}
```

#### Validation قبل الإضافة:
```typescript
const handleAddToIssue = async () => {
  if (selectedResearches.length === 0) {
    toast.error('يرجى اختيار مقال واحد على الأقل');
    return;
  }

  // ✅ التحقق من الحد الأقصى
  if (issue) {
    const remainingSlots = issue.max_articles - issue.total_articles;
    if (selectedResearches.length > remainingSlots) {
      toast.error(
        `لا يمكن إضافة ${selectedResearches.length} مقال. الحد الأقصى المتبقي: ${remainingSlots} مقال`,
        { duration: 5000 }
      );
      return;
    }
  }

  // ... proceed with adding articles
};
```

#### عرض تحذير في شريط البحث:
```tsx
<div className="mt-3 text-sm text-gray-600">
  تم اختيار <span className="font-bold text-gray-800">{selectedResearches.length}</span> مقال
  {issue && selectedResearches.length > 0 && (
    <span className={`mr-2 ${
      selectedResearches.length > (issue.max_articles - issue.total_articles) 
        ? 'text-red-600 font-bold' 
        : 'text-green-600'
    }`}>
      ({selectedResearches.length > (issue.max_articles - issue.total_articles) 
        ? `⚠️ تجاوز الحد الأقصى بـ ${selectedResearches.length - (issue.max_articles - issue.total_articles)} مقال` 
        : '✓ ضمن الحد المسموح'})
    </span>
  )}
</div>
```

**2. صفحة تحرير العدد** (`EditIssuePage.tsx`):

#### Validation قبل الحفظ:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ✅ Validate max_articles
  const newMaxArticles = parseInt(formData.max_articles);
  if (issue && newMaxArticles < issue.total_articles) {
    setError(
      `لا يمكن تقليل الحد الأقصى إلى ${newMaxArticles} لأن العدد يحتوي بالفعل على ${issue.total_articles} مقال. يجب أن يكون الحد الأقصى ${issue.total_articles} على الأقل`
    );
    alert(
      `⚠️ لا يمكن تقليل الحد الأقصى!\n\nالعدد يحتوي حالياً على ${issue.total_articles} مقال.\nالحد الأقصى الجديد يجب أن يكون ${issue.total_articles} على الأقل.`
    );
    return;
  }
  
  // ... proceed with update
};
```

#### UI Enhancement:
```tsx
<input
  type="number"
  value={formData.max_articles}
  onChange={(e) => setFormData({ ...formData, max_articles: e.target.value })}
  min={issue?.total_articles || 1}  // ✅ الحد الأدنى = عدد المقالات الحالية
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
  required
/>
<p className="mt-2 text-xs text-gray-500">
  🎯 لن يمكن إضافة مقالات تتجاوز هذا العدد
</p>
{issue && issue.total_articles > 0 && (
  <p className="mt-1 text-xs text-amber-600 font-medium">
    ⚠️ الحد الأدنى المسموح: {issue.total_articles} (عدد المقالات الحالية)
  </p>
)}
```

**3. صفحة إنشاء عدد جديد** (`ManageIssuesPage.tsx`):
```tsx
<input
  type="number"
  value={formData.max_articles}
  onChange={(e) => setFormData({ ...formData, max_articles: parseInt(e.target.value) || 0 })}
  min="1"
  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
  required
/>
<p className="mt-2 text-xs text-gray-500 text-right">
  🎯 لن يمكن إضافة مقالات تتجاوز هذا العدد
</p>
```

### Workflow:

#### سيناريو 1: إضافة مقالات
1. **إنشاء العدد**: المحرر يحدد الحد الأقصى (مثلاً: 12 مقال)
2. **إضافة مقالات**: 
   - Frontend يعرض: "المتبقي: 12 مقال"
   - عند اختيار مقالات، يظهر تحذير إذا تجاوز الحد
   - Backend يرفض الإضافة إذا تجاوز الحد
3. **عند الوصول للحد**: لا يمكن إضافة المزيد

#### سيناريو 2: تعديل الحد الأقصى
1. **العدد يحتوي على 5 مقالات**
2. **محاولة تقليل الحد إلى 3**:
   - ❌ Frontend: يمنع الإدخال (min=5)
   - ❌ Frontend: alert تحذيري واضح
   - ❌ Backend: يرفض الطلب مع رسالة خطأ
3. **تكبير الحد إلى 15**:
   - ✅ مسموح (أكبر من 5)
   - ✅ يمكن إضافة 10 مقالات إضافية

---

## 📊 UI/UX Enhancements

### 1. بطاقة معلومات العدد (Issue Info Card):
- عرض اسم العدد
- عدد المقالات الحالية
- الحد الأقصى
- العدد المتبقي (بلون أخضر)

### 2. تحذيرات ديناميكية:
- ✅ **أخضر**: عند الاختيار ضمن الحد المسموح
- ⚠️ **أحمر**: عند تجاوز الحد الأقصى
- رسالة واضحة بعدد المقالات الزائدة

### 3. ملاحظات توضيحية:
- 💡 تاريخ النشر: "للتخطيط فقط. عند النشر يتحول لتاريخ النشر الفعلي"
- 🎯 الحد الأقصى: "لن يمكن إضافة مقالات تتجاوز هذا العدد"

---

## 🔒 Security & Validation

### Backend Validation:
1. ✅ التحقق من وجود العدد
2. ✅ التحقق من الحد الأقصى قبل إضافة مقالات
3. ✅ **التحقق من عدم تقليل max_articles تحت total_articles**
4. ✅ رسائل خطأ واضحة بالعربية
5. ✅ BadRequestException مع رسالة مفصلة

### Frontend Validation:
1. ✅ التحقق قبل إرسال الطلب
2. ✅ عرض تحذيرات مرئية
3. ✅ منع الإرسال إذا تجاوز الحد
4. ✅ **HTML input min attribute = total_articles**
5. ✅ **عرض الحد الأدنى المسموح في UI**
6. ✅ Alert تحذيري قبل الحفظ
7. ✅ Toast notifications واضحة

---

## 📝 API Endpoints

### Publish Issue:
```
PATCH /api/issues/:id/publish
Authorization: Bearer {token}
Roles: admin, editor

Response:
{
  "id": "uuid",
  "status": "published",
  "publish_date": "2024-10-23T20:00:00.000Z", // ✅ تاريخ النشر الفعلي
  "progress_percentage": 100,
  ...
}
```

### Create Article:
```
POST /api/articles
Authorization: Bearer {token}
Roles: admin, editor

Request Body:
{
  "issue_id": "uuid",
  "article_number": "ART-2024-001",
  "title": "...",
  ...
}

Error Response (if max reached):
{
  "statusCode": 400,
  "message": "لا يمكن إضافة المزيد من المقالات. الحد الأقصى للعدد هو 12 مقال"
}
```

### Update Issue:
```
PATCH /api/issues/:id
Authorization: Bearer {token}
Roles: admin, editor

Request Body:
{
  "max_articles": 3,  // محاولة تقليل الحد
  ...
}

Error Response (if reducing below total_articles):
{
  "statusCode": 400,
  "message": "لا يمكن تقليل الحد الأقصى إلى 3 لأن العدد يحتوي بالفعل على 5 مقال. يجب أن يكون الحد الأقصى 5 على الأقل"
}
```

---

## ✅ Testing Checklist

### تاريخ النشر:
- [ ] إنشاء عدد بتاريخ مخطط في المستقبل
- [ ] نشر العدد والتحقق من تحديث التاريخ
- [ ] التحقق من عرض التاريخ الصحيح في الصفحة العامة

### الحد الأقصى - إضافة مقالات:
- [ ] إنشاء عدد بحد أقصى 2 مقال
- [ ] إضافة مقالين بنجاح
- [ ] محاولة إضافة مقال ثالث (يجب أن يفشل)
- [ ] التحقق من رسالة الخطأ في Backend
- [ ] التحقق من التحذير في Frontend

### الحد الأقصى - تعديل العدد:
- [ ] إنشاء عدد بحد أقصى 10 مقالات
- [ ] إضافة 5 مقالات للعدد
- [ ] محاولة تقليل الحد الأقصى إلى 3 (يجب أن يفشل)
- [ ] التحقق من:
  - [ ] HTML input min="5"
  - [ ] رسالة تحذيرية في UI: "⚠️ الحد الأدنى المسموح: 5"
  - [ ] Alert عند محاولة الحفظ
  - [ ] رسالة خطأ من Backend
- [ ] تكبير الحد الأقصى إلى 15 (يجب أن ينجح)
- [ ] التحقق من إمكانية إضافة 10 مقالات إضافية

---

## 📚 Files Modified

### Backend:
- ✅ `/apps/backend/src/modules/issues/issues.service.ts`
- ✅ `/apps/backend/src/modules/articles/articles.service.ts`

### Frontend:
- ✅ `/apps/frontend/src/pages/dashboard/editor-admin/ManageIssuesPage.tsx`
- ✅ `/apps/frontend/src/pages/dashboard/editor-admin/EditIssuePage.tsx`
- ✅ `/apps/frontend/src/pages/dashboard/editor-admin/AddArticleToIssuePage.tsx`

---

## 🎉 Status

✅ **Backend**: Complete
✅ **Frontend**: Complete
✅ **Validation**: Complete
✅ **UI/UX**: Complete
✅ **Documentation**: Complete

**Ready for Testing!** 🚀
