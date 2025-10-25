# تكامل Articles & Issues - Frontend Integration

## 📋 نظرة عامة

تم إكمال تكامل **Articles** و **Issues** بالكامل في Frontend مع ربطها بـ Backend API.

---

## 🎯 الملفات التي تم إنشاؤها/تحديثها

### 1. خدمات API (Services)

#### **articlesService.ts** ✅
```typescript
/apps/frontend/src/services/articlesService.ts
```

**الوظائف المتاحة:**
- `getAllArticles()` - جلب جميع المقالات (Admin/Editor)
- `getPublishedArticles()` - جلب المقالات المنشورة (Public)
- `getArticleById(id)` - جلب مقال بـ ID
- `getArticleByNumber(articleNumber)` - جلب مقال برقمه
- `getArticleByResearchId(researchId)` - جلب مقال من بحث
- `createArticle(data)` - إنشاء مقال جديد
- `updateArticle(id, data)` - تحديث مقال
- `deleteArticle(id)` - حذف مقال (Admin only)
- `publishArticle(id)` - نشر مقال
- `searchArticles(query)` - البحث في المقالات
- `getArticlesStats()` - إحصائيات المقالات
- `incrementArticleViews(id)` - زيادة عدد المشاهدات
- `verifyArticle(id)` - التحقق من مقال (QR Code)
- `verifyArticleByDOI(doi)` - التحقق بـ DOI
- `regenerateArticleQRCode(id)` - إعادة توليد QR Code
- `getArticlesByIssueId(issueId)` - جلب مقالات عدد معين

**Types:**
```typescript
export type ArticleStatus = 'ready-to-publish' | 'published';

export interface ArticleAuthor {
  name: string;
  affiliation: string;
  email: string;
}

export interface Article {
  id: string;
  research_id: string;
  issue_id: string;
  article_number: string;
  title: string;
  title_en?: string;
  authors: ArticleAuthor[];
  abstract: string;
  abstract_en?: string;
  keywords: string[];
  keywords_en?: string[];
  pages: string;
  doi?: string;
  pdf_url?: string;
  cloudinary_public_id?: string;
  cloudinary_secure_url?: string;
  qr_code_url?: string;
  qr_code_public_id?: string;
  status: ArticleStatus;
  views_count: number;
  downloads_count: number;
  citations_count: number;
  created_at: string;
  updated_at: string;
  issue?: { ... };
  research?: { ... };
}
```

---

#### **issuesService.ts** ✅
```typescript
/apps/frontend/src/services/issuesService.ts
```

**الوظائف المتاحة:**
- `getAllIssues()` - جلب جميع الأعداد (Admin/Editor)
- `getPublishedIssues()` - جلب الأعداد المنشورة (Public)
- `getLatestIssue()` - جلب أحدث عدد (Public)
- `getIssueById(id)` - جلب عدد بـ ID
- `getIssueByNumber(issueNumber)` - جلب عدد برقمه
- `createIssue(data)` - إنشاء عدد جديد
- `updateIssue(id, data)` - تحديث عدد
- `deleteIssue(id)` - حذف عدد (Admin only)
- `publishIssue(id)` - نشر عدد
- `incrementIssueViews(id)` - زيادة عدد المشاهدات
- `getIssuesStats()` - إحصائيات الأعداد

**Types:**
```typescript
export type IssueStatus = 'planned' | 'in-progress' | 'published';

export interface Issue {
  id: string;
  issue_number: string;
  title: string;
  description?: string;
  publish_date: string;
  max_articles: number;
  cover_image_url?: string;
  cover_image_public_id?: string;
  status: IssueStatus;
  total_articles: number;
  total_pages: number;
  downloads_count: number;
  views_count: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}
```

---

### 2. صفحات Dashboard

#### **AddArticleToIssuePage.tsx** ✅
```typescript
/apps/frontend/src/pages/dashboard/editor-admin/AddArticleToIssuePage.tsx
```

**الوظائف:**
- جلب الأبحاث المقبولة (status: 'accepted') التي لم تُحول لمقالات بعد
- تحويل تلقائي من Research إلى Article
- اختيار متعدد للأبحاث
- إضافة للعدد المحدد
- Loading states و Error handling

**Features:**
- ✅ يجلب الأبحاث من API
- ✅ يفلتر الأبحاث المقبولة فقط (`!published_article_id`)
- ✅ تحويل تلقائي باستخدام `createArticle()`
- ✅ يملأ بيانات المقال من البحث (title, abstract, keywords, authors)
- ✅ Loading spinner أثناء التحويل
- ✅ رسائل خطأ واضحة

---

#### **ArticleDetailsPage.tsx** ✅
```typescript
/apps/frontend/src/pages/dashboard/editor-admin/ArticleDetailsPage.tsx
```

**الوظائف:**
- عرض تفاصيل المقال الكاملة
- عرض QR Code للتحقق
- عرض معلومات المؤلفين
- عرض معلومات العدد
- إحصائيات (المشاهدات، التحميلات)

**Features:**
- ✅ يجلب المقال من API
- ✅ عرض QR Code (إذا كان موجوداً)
- ✅ عرض جميع المؤلفين
- ✅ عرض الكلمات المفتاحية
- ✅ عرض DOI
- ✅ زر تحميل PDF
- ✅ زر تحرير المقال
- ✅ Loading و Error states

---

#### **EditArticlePage.tsx** ✅
```typescript
/apps/frontend/src/pages/dashboard/editor-admin/EditArticlePage.tsx
```

**الوظائف:**
- تحرير معلومات المقال
- إدارة المؤلفين (إضافة/حذف)
- تغيير العدد
- تحديث الحالة

**Features:**
- ✅ يجلب المقال والأعداد من API
- ✅ نموذج كامل لتحرير المقال
- ✅ إدارة متعددة للمؤلفين
- ✅ دعم العربي والإنجليزي (title, abstract, keywords)
- ✅ اختيار العدد من dropdown
- ✅ تحديث الحالة (ready-to-publish / published)
- ✅ Validation كامل
- ✅ Loading أثناء الحفظ

**حقول النموذج:**
- رقم المقال (disabled)
- عنوان المقال (عربي + إنجليزي)
- الملخص (عربي + إنجليزي)
- الكلمات المفتاحية (عربي + إنجليزي)
- المؤلفون (اسم، انتماء، بريد) - متعدد
- العدد
- الصفحات
- DOI
- الحالة

---

#### **EditIssuePage.tsx** ✅
```typescript
/apps/frontend/src/pages/dashboard/editor-admin/EditIssuePage.tsx
```

**الوظائف:**
- تحرير معلومات العدد
- تحديث الحالة
- تغيير تاريخ النشر

**Features:**
- ✅ يجلب العدد من API
- ✅ نموذج كامل لتحرير العدد
- ✅ تحديث جميع الحقول
- ✅ تغيير الحالة (planned / in-progress / published)
- ✅ Validation كامل
- ✅ Loading أثناء الحفظ

**حقول النموذج:**
- رقم العدد
- عنوان العدد
- وصف العدد
- تاريخ النشر المخطط
- الحد الأقصى للمقالات
- حالة العدد

---

#### **ViewIssueArticlesPage.tsx** ✅
```typescript
/apps/frontend/src/pages/dashboard/editor-admin/ViewIssueArticlesPage.tsx
```

**الوظائف:**
- عرض جميع مقالات العدد
- حذف مقالات من العدد
- عرض إحصائيات العدد
- اختيار متعدد للمقالات

**Features:**
- ✅ يجلب العدد والمقالات من API
- ✅ جدول كامل بالمقالات
- ✅ اختيار متعدد (checkboxes)
- ✅ حذف مقالات محددة
- ✅ عرض معلومات العدد (رقم، تاريخ، تقدم)
- ✅ Progress bar للتقدم
- ✅ ملخص إحصائي (إجمالي، منشور، جاهز)
- ✅ أزرار عرض وتحميل لكل مقال
- ✅ Loading و Error states

---

## 🔄 سير العمل (Workflow)

### تحويل Research إلى Article

```
1. Research Status = 'accepted'
   ↓
2. Editor يذهب لـ AddArticleToIssuePage
   ↓
3. يختار الأبحاث المقبولة
   ↓
4. يضغط "إضافة للعدد"
   ↓
5. Frontend يستدعي createArticle() لكل بحث
   ↓
6. Backend:
   - ينشئ Article جديد
   - يولد article_number تلقائياً
   - يولد QR Code تلقائياً
   - يحدث research.status = 'published'
   - يحدث research.published_article_id
   - يحدث issue.total_articles
   ↓
7. Frontend يعرض رسالة نجاح
```

---

## 📊 Integration Points

### 1. Research → Article
- عند إنشاء Article من Research:
  - يتم نسخ: title, abstract, keywords, authors
  - يتم تحديث: research.status = 'published'
  - يتم ربط: research.published_article_id = article.id

### 2. Article → Issue
- عند إضافة Article لـ Issue:
  - يتم تحديث: issue.total_articles
  - يتم تحديث: issue.progress_percentage
  - يتم حساب: issue.total_pages

### 3. QR Code Generation
- يتم توليد QR Code تلقائياً عند إنشاء Article
- QR Code يشير إلى: `/verify-article/{article.id}`
- يتم رفع QR Code على Cloudinary
- يتم حفظ: article.qr_code_url

---

## 🎨 UI/UX Features

### Loading States
- ✅ Spinner أثناء تحميل البيانات
- ✅ رسائل واضحة ("جاري تحميل...")
- ✅ تعطيل الأزرار أثناء العمليات

### Error Handling
- ✅ رسائل خطأ واضحة بالعربي
- ✅ عرض الأخطاء في alert boxes
- ✅ إمكانية إعادة المحاولة

### Form Validation
- ✅ Required fields
- ✅ Email validation
- ✅ Number validation (max_articles, pages)
- ✅ Date validation

### User Feedback
- ✅ رسائل نجاح بعد كل عملية
- ✅ تأكيد قبل الحذف
- ✅ Progress indicators

---

## 🔐 Authorization

جميع الصفحات تتطلب:
- **Role:** Admin أو Editor
- **Authentication:** JWT Token في localStorage

---

## 📝 API Endpoints المستخدمة

### Articles
- `GET /api/articles` - جلب جميع المقالات
- `GET /api/articles/:id` - جلب مقال
- `POST /api/articles` - إنشاء مقال
- `PATCH /api/articles/:id` - تحديث مقال
- `DELETE /api/articles/:id` - حذف مقال
- `GET /api/articles/verify/:id` - التحقق من مقال

### Issues
- `GET /api/issues` - جلب جميع الأعداد
- `GET /api/issues/:id` - جلب عدد
- `PATCH /api/issues/:id` - تحديث عدد

### Research
- `GET /api/research` - جلب جميع الأبحاث

---

## ✅ Status Summary

| Component | Status | Features |
|-----------|--------|----------|
| **articlesService.ts** | ✅ Complete | All CRUD + QR Code |
| **issuesService.ts** | ✅ Complete | All CRUD + Stats |
| **AddArticleToIssuePage** | ✅ Complete | Auto-convert Research → Article |
| **ArticleDetailsPage** | ✅ Complete | Full details + QR Code |
| **EditArticlePage** | ✅ Complete | Multi-author support |
| **EditIssuePage** | ✅ Complete | Full form validation |
| **ViewIssueArticlesPage** | ✅ Complete | Table + Bulk delete |

---

## 🚀 Next Steps

### Frontend (Optional Enhancements)
1. ✨ إضافة صفحة عامة للتحقق من المقالات (`/verify-article/:id`)
2. ✨ إضافة صفحة عامة لعرض الأعداد المنشورة
3. ✨ إضافة صفحة عامة لعرض المقالات المنشورة
4. ✨ إضافة بحث متقدم في المقالات
5. ✨ إضافة تصدير المقالات (PDF, CSV)

### Backend (Already Complete)
- ✅ QR Code generation
- ✅ Auto-increment article numbers
- ✅ Issue stats calculation
- ✅ Research integration
- ✅ Cloudinary integration

---

## 📚 Documentation Files

- `ISSUES_ARTICLES_BACKEND.md` - Backend documentation
- `QRCODE_VERIFICATION_SYSTEM.md` - QR Code system
- `ARTICLES_ISSUES_FRONTEND_INTEGRATION.md` - This file

---

## 🎉 Completion Status

**✅ 100% Complete**

جميع الصفحات المطلوبة تم تحديثها وربطها بالـ Backend API بنجاح!
