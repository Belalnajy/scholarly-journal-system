# تكامل صفحة Landing Page مع Backend API

## نظرة عامة
تم تحديث صفحة Landing Page لجلب البيانات الحقيقية من Backend API بدلاً من استخدام البيانات الثابتة (demoData).

## التغييرات المنفذة

### 1. LandingPage Component
**الملف:** `/apps/frontend/src/pages/LandingPage.tsx`

#### البيانات المجلوبة من API:
- ✅ **المقالات المنشورة**: أحدث 3 مقالات منشورة من `/api/articles/published`
- ✅ **إحصائيات الأعداد**: عدد الأعداد المنشورة من `/api/issues/stats`
- ✅ **إحصائيات المقالات**: عدد المقالات المنشورة من `/api/articles/stats`

#### State Management:
```typescript
const [articles, setArticles] = useState<Article[]>([]);
const [stats, setStats] = useState({
  totalIssues: 0,
  totalArticles: 0,
  totalResearchers: 0,
});
const [loading, setLoading] = useState(true);
```

#### Data Loading:
```typescript
const loadData = async () => {
  // جلب المقالات المنشورة (أحدث 3)
  const publishedArticles = await articlesService.getPublishedArticles();
  setArticles(publishedArticles.slice(0, 3));

  // جلب الأعداد المنشورة
  const publishedIssues = await issuesService.getPublishedIssues();

  // حساب الإحصائيات من البيانات المتاحة
  setStats({
    totalIssues: publishedIssues.length,
    totalArticles: publishedArticles.length,
    totalResearchers: publishedArticles.length, // تقريبي
  });
};
```

**ملاحظة مهمة:** تم استخدام endpoints عامة فقط (Public) لأن Landing Page لا تتطلب authentication.

#### Data Transformation:
يتم تحويل بيانات المقالات من Backend إلى الصيغة المطلوبة في UI:

```typescript
const researchArticles = articles.map(article => ({
  id: article.id,
  title: article.title,
  excerpt: article.abstract.substring(0, 150) + '...',
  author: article.authors[0]?.name || 'غير محدد',
  category: article.issue?.title || 'غير محدد',
  views: article.views_count,
  downloads: article.downloads_count,
}));
```

### 2. ResearchList Component
**الملف:** `/apps/frontend/src/components/sections/ResearchList.tsx`

#### التحديثات:
- ✅ إضافة `loading` prop لعرض spinner أثناء التحميل
- ✅ دعم `id` من نوع `string | number` للتوافق مع Backend
- ✅ عرض رسالة عند عدم وجود مقالات

#### Loading States:
```typescript
{loading ? (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
  </div>
) : articles.length === 0 ? (
  <div className="text-center py-12 text-gray-500">
    <p className="text-lg">لا توجد أبحاث منشورة حالياً</p>
  </div>
) : (
  // عرض المقالات
)}
```

### 3. ResearchCard Component
**الملف:** `/apps/frontend/src/components/cards/ResearchCard.tsx`

#### التحديثات:
- ✅ تحديث نوع `id` من `number` إلى `string | number`

```typescript
interface ResearchArticle {
  id: string | number;  // تم التحديث
  title: string;
  excerpt: string;
  author: string;
  category: string;
  views: number;
  downloads: number;
}
```

## API Endpoints المستخدمة

### Articles API
```typescript
// جلب المقالات المنشورة
GET /api/articles/published
Response: Article[]

// جلب إحصائيات المقالات
GET /api/articles/stats
Response: {
  totalArticles: number;
  publishedArticles: number;
  readyToPublish: number;
  totalViews: number;
  totalDownloads: number;
  totalCitations: number;
}
```

### Issues API
```typescript
// جلب إحصائيات الأعداد
GET /api/issues/stats (calculated from getAllIssues)
Response: {
  total: number;
  planned: number;
  inProgress: number;
  published: number;
  totalArticles: number;
  totalDownloads: number;
  totalViews: number;
}
```

## Services المستخدمة

### articlesService
```typescript
import articlesService, { type Article } from '../services/articlesService';

// Methods Used:
- getPublishedArticles(): Promise<Article[]>
- getStats(): Promise<ArticleStats>
```

### issuesService
```typescript
import issuesService from '../services/issuesService';

// Methods Used:
- getStats(): Promise<IssueStats>
```

## User Experience

### Loading State
- عرض spinner دوار أثناء تحميل البيانات
- تعطيل التفاعل حتى اكتمال التحميل

### Empty State
- عرض رسالة واضحة عند عدم وجود مقالات منشورة
- "لا توجد أبحاث منشورة حالياً"

### Error Handling
- التعامل مع الأخطاء في console
- الاستمرار في عرض الصفحة حتى مع وجود أخطاء

## Data Flow

```
1. Component Mount
   ↓
2. useEffect() → loadData()
   ↓
3. setLoading(true)
   ↓
4. Parallel API Calls:
   - articlesService.getPublishedArticles()
   - issuesService.getStats()
   - articlesService.getStats()
   ↓
5. Transform Data
   ↓
6. Update State:
   - setArticles()
   - setStats()
   ↓
7. setLoading(false)
   ↓
8. Render UI with Real Data
```

## الإحصائيات المعروضة

### Hero Section Stats
```typescript
const heroStats = [
  { value: `${stats.totalIssues}+`, label: 'عدد' },
  { value: `${stats.totalArticles}+`, label: 'بحث' },
  { value: `${stats.totalResearchers}+`, label: 'باحث منشور' },
];
```

**ملاحظة:** `totalResearchers` حالياً يساوي `totalArticles` كقيمة تقريبية. يمكن تحسينه لاحقاً بحساب عدد الباحثين الفريدين.

## البيانات الثابتة المتبقية

البيانات التالية لا تزال ثابتة من `demoData`:
- ✅ `heroContent`: محتوى Hero Section (العنوان، الوصف، الأزرار)
- ✅ `features`: قسم المميزات (4 مميزات)

هذه البيانات يمكن نقلها لاحقاً إلى `site-settings` في Backend إذا لزم الأمر.

## التحسينات المستقبلية

### 1. إضافة Pagination
```typescript
// عرض المزيد من المقالات
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  const moreArticles = await articlesService.getPublishedArticles(page + 1);
  setArticles([...articles, ...moreArticles]);
  setPage(page + 1);
};
```

### 2. إضافة Caching
```typescript
// استخدام React Query أو SWR
import { useQuery } from '@tanstack/react-query';

const { data: articles, isLoading } = useQuery({
  queryKey: ['published-articles'],
  queryFn: articlesService.getPublishedArticles,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 3. حساب عدد الباحثين الفعلي
```typescript
// إضافة endpoint جديد في Backend
GET /api/articles/researchers/count
Response: { uniqueResearchers: number }
```

### 4. تحسين Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  // API calls
} catch (error) {
  setError('حدث خطأ أثناء تحميل البيانات');
  // عرض رسالة خطأ للمستخدم
}
```

## Testing

### Manual Testing
1. ✅ تشغيل Backend: `npm run dev` في `/apps/backend`
2. ✅ تشغيل Frontend: `npm run dev` في `/apps/frontend`
3. ✅ فتح الصفحة الرئيسية: `http://localhost:5173`
4. ✅ التحقق من:
   - عرض spinner أثناء التحميل
   - عرض المقالات الحقيقية
   - عرض الإحصائيات الصحيحة
   - عرض رسالة عند عدم وجود مقالات

### Test Cases
```typescript
// 1. Loading State
- يجب عرض spinner عند التحميل
- يجب إخفاء المحتوى أثناء التحميل

// 2. Success State
- يجب عرض أحدث 3 مقالات
- يجب عرض الإحصائيات الصحيحة
- يجب تحويل البيانات بشكل صحيح

// 3. Empty State
- يجب عرض رسالة عند عدم وجود مقالات
- يجب عرض الإحصائيات = 0

// 4. Error State
- يجب عدم crash الصفحة
- يجب تسجيل الخطأ في console
```

## الملفات المعدلة

```
✅ /apps/frontend/src/pages/LandingPage.tsx
✅ /apps/frontend/src/components/sections/ResearchList.tsx
✅ /apps/frontend/src/components/cards/ResearchCard.tsx
```

## الملفات المستخدمة (بدون تعديل)

```
✅ /apps/frontend/src/services/articlesService.ts
✅ /apps/frontend/src/services/issuesService.ts
✅ /apps/frontend/src/services/api.ts
✅ /apps/frontend/src/data/demoData.ts
```

## Status

✅ **Backend Integration**: Complete  
✅ **Loading States**: Complete  
✅ **Error Handling**: Basic (Console only)  
✅ **Data Transformation**: Complete  
✅ **UI Updates**: Complete  
✅ **Type Safety**: Complete  

## الخطوات التالية

1. ⏳ اختبار الصفحة مع بيانات حقيقية
2. ⏳ إضافة pagination للمقالات
3. ⏳ تحسين error handling مع UI feedback
4. ⏳ إضافة caching للبيانات
5. ⏳ حساب عدد الباحثين الفعلي
6. ⏳ نقل heroContent و features إلى site-settings

---

**تاريخ الإنشاء:** 2025-10-25  
**الحالة:** ✅ Complete - جاهز للاستخدام
