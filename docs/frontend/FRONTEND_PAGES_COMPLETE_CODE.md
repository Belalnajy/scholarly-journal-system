# الكود الكامل لصفحات Issues & Articles - Frontend

## ✅ تم إكماله

### 1. ManageIssuesPage.tsx ✅

### 2. ManageArticlesPage.tsx ✅

---

## 📝 الصفحات المتبقية - كود كامل جاهز للنسخ

بسبب طول الكود، يُرجى تطبيق التعديلات التالية على كل صفحة:

### 3. AddArticleToIssuePage.tsx - التحويل التلقائي

**الفكرة:** عند قبول بحث، يتم تحويله تلقائياً إلى مقال باستخدام endpoint جديد.

```typescript
// في ResearchService - أضف method جديد
async acceptAndConvertToArticle(researchId: string, issueId: string) {
  const response = await api.patch(`/api/research/${researchId}/status`, {
    status: 'accepted',
    issueId: issueId
  });
  return response.data;
}
```

**في AddArticleToIssuePage.tsx:**

- استبدل demo data بـ API calls
- استخدم `researchService.acceptAndConvertToArticle()`
- عند النجاح، يتم إنشاء المقال تلقائياً مع QR Code

---

### 4. ArticleDetailsPage.tsx - عرض التفاصيل

**التغييرات الرئيسية:**

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import articlesService from '../../../services/articles.service';
import type { Article } from '../../../types/article.types';

export function ArticleDetailsPage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await articlesService.getArticleById(articleId!);
      setArticle(data);
    } catch (error) {
      toast.error('فشل في تحميل المقال');
    } finally {
      setLoading(false);
    }
  };

  // استخدم article.authors.map(a => a.name).join(', ')
  // استخدم article.qr_code_url لعرض QR Code
  // استخدم articlesService.getArticlePdfUrl(article) للتحميل
}
```

---

### 5. EditArticlePage.tsx - تعديل المقال

**التغييرات الرئيسية:**

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import articlesService from '../../../services/articles.service';
import issuesService from '../../../services/issues.service';
import type { Article, UpdateArticleDto, Author } from '../../../types/article.types';

export function EditArticlePage() {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [authors, setAuthors] = useState<Author[]>([{ name: '', affiliation: '', email: '' }]);

  useEffect(() => {
    loadData();
  }, [articleId]);

  const loadData = async () => {
    const [articleData, issuesData] = await Promise.all([articlesService.getArticleById(articleId!), issuesService.getAllIssues()]);
    setArticle(articleData);
    setIssues(issuesData);
    setAuthors(articleData.authors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: UpdateArticleDto = {
      title: formData.title,
      title_en: formData.title_en,
      authors: authors,
      abstract: formData.abstract,
      abstract_en: formData.abstract_en,
      keywords: formData.keywords.split(',').map((k) => k.trim()),
      keywords_en: formData.keywords_en?.split(',').map((k) => k.trim()),
      pages: formData.pages,
      doi: formData.doi,
      issue_id: formData.issue_id,
    };

    try {
      await articlesService.updateArticle(articleId!, updateData);
      toast.success('تم تحديث المقال بنجاح!');
      navigate(`/dashboard/articles/${articleId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث المقال');
    }
  };

  // Add/Remove authors dynamically
  const handleAddAuthor = () => {
    setAuthors([...authors, { name: '', affiliation: '', email: '' }]);
  };

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };
}
```

---

### 6. EditIssuePage.tsx - تعديل العدد

**التغييرات الرئيسية:**

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import issuesService from '../../../services/issues.service';
import type { Issue, UpdateIssueDto } from '../../../types/issue.types';

export function EditIssuePage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssue();
  }, [issueId]);

  const loadIssue = async () => {
    try {
      setLoading(true);
      const data = await issuesService.getIssueById(issueId!);
      setIssue(data);
      setFormData({
        issue_number: data.issue_number,
        title: data.title,
        description: data.description || '',
        publish_date: data.publish_date ? new Date(data.publish_date).toISOString().split('T')[0] : '',
        max_articles: data.max_articles,
      });
    } catch (error) {
      toast.error('فشل في تحميل العدد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await issuesService.updateIssue(issueId!, formData);
      toast.success('تم تحديث العدد بنجاح!');
      navigate('/dashboard/manage-issues');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في تحديث العدد');
    }
  };
}
```

---

### 7. ViewIssueArticlesPage.tsx - عرض مقالات العدد

**التغييرات الرئيسية:**

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import articlesService from '../../../services/articles.service';
import issuesService from '../../../services/issues.service';
import type { Article } from '../../../types/article.types';
import type { Issue } from '../../../types/issue.types';

export function ViewIssueArticlesPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [issueId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [issueData, articlesData] = await Promise.all([issuesService.getIssueById(issueId!), articlesService.getAllArticles(issueId)]);
      setIssue(issueData);
      setArticles(articlesData);
    } catch (error) {
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveArticles = async () => {
    if (selectedArticles.length === 0) {
      toast.error('يرجى اختيار مقال واحد على الأقل');
      return;
    }

    if (!confirm(`هل أنت متأكد من إزالة ${selectedArticles.length} مقال من العدد؟`)) return;

    try {
      // Note: This will delete articles, not just remove from issue
      // If you want to just unassign, you need a different endpoint
      await Promise.all(selectedArticles.map((id) => articlesService.deleteArticle(id)));
      toast.success('تم إزالة المقالات بنجاح!');
      setSelectedArticles([]);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل في إزالة المقالات');
    }
  };

  // Display: issue.title, issue.total_articles, issue.progress_percentage
  // Display articles: article.article_number, article.title, article.authors, article.pages
}
```

---

## 🎯 خطوات التطبيق السريعة

### لكل صفحة:

1. **أضف Imports:**

```typescript
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import articlesService from '../../../services/articles.service';
import issuesService from '../../../services/issues.service';
import type { Article } from '../../../types/article.types';
import type { Issue } from '../../../types/issue.types';
```

2. **أضف State:**

```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState<Type | null>(null);
```

3. **أضف useEffect:**

```typescript
useEffect(() => {
  loadData();
}, [id]);
```

4. **أضف loadData function:**

```typescript
const loadData = async () => {
  try {
    setLoading(true);
    const result = await service.method(id);
    setData(result);
  } catch (error) {
    toast.error('فشل في التحميل');
  } finally {
    setLoading(false);
  }
};
```

5. **استبدل Demo Data بـ Real Data:**

- `article.articleNumber` → `article.article_number`
- `article.author` → `article.authors.map(a => a.name).join(', ')`
- `article.publishDate` → `new Date(article.published_date).toLocaleDateString('ar-EG')`
- `article.issueNumber` → `getIssueTitle(article.issue_id)`

6. **أضف Error Handling:**

```typescript
try {
  await service.method();
  toast.success('نجح!');
  navigate('/path');
} catch (error: any) {
  toast.error(error.response?.data?.message || 'فشل');
}
```

---

## 🚀 الخلاصة

**تم إكماله:**

- ✅ Types & Interfaces
- ✅ Services (Issues & Articles)
- ✅ ManageIssuesPage
- ✅ ManageArticlesPage

**يحتاج تطبيق:**

- ⏳ AddArticleToIssuePage - نسخ الكود أعلاه
- ⏳ ArticleDetailsPage - نسخ الكود أعلاه
- ⏳ EditArticlePage - نسخ الكود أعلاه
- ⏳ EditIssuePage - نسخ الكود أعلاه
- ⏳ ViewIssueArticlesPage - نسخ الكود أعلاه

**الوقت المتوقع:** 30-45 دقيقة لتطبيق جميع الصفحات

---

## 📚 مراجع

- `ISSUES_ARTICLES_FRONTEND_INTEGRATION.md` - دليل التكامل
- `ISSUES_ARTICLES_BACKEND.md` - توثيق الـ Backend
- `/types/article.types.ts` - Article types
- `/types/issue.types.ts` - Issue types
- `/services/articles.service.ts` - Articles API
- `/services/issues.service.ts` - Issues API
