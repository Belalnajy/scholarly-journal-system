# 📚 Issues & Articles Backend Implementation

## ✅ Status: Complete

تم إنشاء وتكامل **Issues** و **Articles** modules بالكامل في الـ backend مع اتباع best practices.

---

## 📊 Database Schema

### 1. Issues Table
```typescript
@Entity('issues')
export class Issue {
  id: UUID (PK)
  issue_number: string (UNIQUE)
  title: string
  description: text
  publish_date: date
  max_articles: int (default: 12)
  cover_image_url: text
  status: enum ('planned', 'in-progress', 'published')
  progress_percentage: int (0-100)
  total_articles: int
  total_pages: int
  downloads_count: int
  views_count: int
  created_at: timestamp
  updated_at: timestamp
  
  // Relations
  articles: Article[] (OneToMany)
}
```

**Indexes:**
- `idx_issues_number` - على issue_number
- `idx_issues_status` - على status
- `idx_issues_publish_date` - على publish_date

### 2. Articles Table
```typescript
@Entity('articles')
export class Article {
  id: UUID (PK)
  research_id: UUID (FK, UNIQUE) - nullable
  issue_id: UUID (FK)
  article_number: string (UNIQUE)
  title: string
  title_en: string
  authors: JSON (Author[])
  abstract: text
  abstract_en: text
  keywords: JSON (string[])
  keywords_en: JSON (string[])
  pages: string ("1-15")
  doi: string
  pdf_url: text
  cloudinary_public_id: text
  cloudinary_secure_url: text
  status: enum ('ready-to-publish', 'published')
  views_count: int
  downloads_count: int
  citations_count: int
  published_date: timestamp
  created_at: timestamp
  updated_at: timestamp
  
  // Relations
  issue: Issue (ManyToOne)
  research: Research (OneToOne)
}
```

**Indexes:**
- `idx_articles_number` - على article_number
- `idx_articles_research` - على research_id
- `idx_articles_issue` - على issue_id
- `idx_articles_status` - على status
- `idx_articles_issue_status` - composite على (issue_id, status)
- `idx_articles_published_date` - على published_date

---

## 🏗️ Architecture

### Entity Relationships
```
Issue (1) ←→ (N) Article
Article (1) ←→ (1) Research
```

### Key Design Decisions

1. **Separation of Concerns**
   - `Research` = البحث أثناء المراجعة
   - `Article` = المقال المنشور
   - `Issue` = العدد الذي يحتوي المقالات

2. **Bidirectional Linking**
   - `Article.research_id` → يشير للبحث الأصلي
   - `Research.published_article_id` → يشير للمقال المنشور
   - يحافظ على الـ Audit Trail

3. **Cloudinary Integration**
   - دعم كامل لـ PDF files
   - حقول `cloudinary_public_id` و `cloudinary_secure_url`
   - متوافق مع نظام Cloudinary الموجود

---

## 🎯 API Endpoints

### Issues Module

#### Admin/Editor Endpoints
```typescript
POST   /api/issues                    // Create issue
GET    /api/issues                    // Get all issues (with filters)
GET    /api/issues/:id                // Get issue by ID
PATCH  /api/issues/:id                // Update issue
PATCH  /api/issues/:id/publish        // Publish issue
PATCH  /api/issues/:id/update-stats   // Update statistics
DELETE /api/issues/:id                // Delete issue (Admin only)
```

#### Public Endpoints
```typescript
GET    /api/issues/published          // Get published issues
GET    /api/issues/latest             // Get latest issue
GET    /api/issues/:id                // Get issue details
GET    /api/issues/number/:issueNumber // Get by issue number
POST   /api/issues/:id/view           // Increment views
POST   /api/issues/:id/download       // Increment downloads
```

### Articles Module

#### Admin/Editor Endpoints
```typescript
POST   /api/articles                  // Create article
GET    /api/articles                  // Get all articles (with filters)
GET    /api/articles/:id              // Get article by ID
GET    /api/articles/research/:researchId // Get by research ID
PATCH  /api/articles/:id              // Update article
PATCH  /api/articles/:id/publish      // Publish article
POST   /api/articles/:id/citation     // Increment citations
DELETE /api/articles/:id              // Delete article (Admin only)
GET    /api/articles/stats            // Get statistics
```

#### Public Endpoints
```typescript
GET    /api/articles/published        // Get published articles
GET    /api/articles/search?q=query   // Search articles
GET    /api/articles/:id              // Get article details
GET    /api/articles/number/:articleNumber // Get by article number
POST   /api/articles/:id/view         // Increment views
POST   /api/articles/:id/download     // Increment downloads
```

---

## 🔐 Authorization

### Issues Module
- **Create/Update/Publish**: `admin`, `editor`
- **Delete**: `admin` only
- **View Published**: Public
- **View All**: `admin`, `editor`

### Articles Module
- **Create/Update/Publish**: `admin`, `editor`
- **Delete**: `admin` only
- **View Published**: Public
- **Search**: Public
- **View All**: `admin`, `editor`
- **Statistics**: `admin`, `editor`

---

## 📝 DTOs & Validation

### CreateIssueDto
```typescript
{
  issue_number: string (required, max: 50)
  title: string (required, max: 500)
  description?: string
  publish_date: date (required)
  max_articles?: int (default: 12)
  cover_image_url?: string
  status?: IssueStatus
  progress_percentage?: int (0-100)
}
```

### CreateArticleDto
```typescript
{
  research_id?: UUID
  issue_id: UUID (required)
  article_number: string (required, max: 50)
  title: string (required, max: 500)
  title_en?: string (max: 500)
  authors: Author[] (required)
  abstract: string (required)
  abstract_en?: string
  keywords: string[] (required)
  keywords_en?: string[]
  pages?: string ("1-15")
  doi?: string (max: 255)
  pdf_url: string (required)
  status?: ArticleStatus
}
```

### AuthorDto
```typescript
{
  name: string (required)
  affiliation: string (required)
  email: string (required, valid email)
}
```

---

## 🔄 Service Methods

### IssuesService

**CRUD Operations:**
- `create(dto)` - إنشاء عدد جديد
- `findAll(status?)` - جلب كل الأعداد مع فلترة
- `findOne(id)` - جلب عدد واحد
- `findByIssueNumber(number)` - جلب بالرقم
- `update(id, dto)` - تحديث عدد
- `remove(id)` - حذف عدد

**Business Logic:**
- `publish(id)` - نشر العدد
- `updateStats(id)` - تحديث الإحصائيات
- `incrementViews(id)` - زيادة المشاهدات
- `incrementDownloads(id)` - زيادة التحميلات

**Public Methods:**
- `getPublishedIssues()` - الأعداد المنشورة
- `getLatestIssue()` - أحدث عدد

### ArticlesService

**CRUD Operations:**
- `create(dto)` - إنشاء مقال (يربط بالبحث تلقائياً)
- `findAll(issueId?, status?)` - جلب كل المقالات
- `findOne(id)` - جلب مقال واحد
- `findByArticleNumber(number)` - جلب بالرقم
- `findByResearchId(researchId)` - جلب بمعرف البحث
- `update(id, dto)` - تحديث مقال
- `remove(id)` - حذف مقال (يفك الربط مع البحث)

**Business Logic:**
- `publish(id)` - نشر المقال
- `incrementViews(id)` - زيادة المشاهدات
- `incrementDownloads(id)` - زيادة التحميلات
- `incrementCitations(id)` - زيادة الاستشهادات

**Public Methods:**
- `getPublishedArticles(issueId?)` - المقالات المنشورة
- `search(query)` - بحث في المقالات
- `getStats()` - إحصائيات شاملة

---

## 🔗 Integration Points

### 1. Research Integration
عند إنشاء مقال من بحث:
```typescript
// في ArticlesService.create()
if (createArticleDto.research_id) {
  // 1. التحقق من وجود البحث
  const research = await researchRepository.findOne(research_id);
  
  // 2. التحقق من عدم نشره مسبقاً
  if (research.published_article_id) {
    throw ConflictException('البحث منشور بالفعل');
  }
  
  // 3. إنشاء المقال
  const article = await articleRepository.save(dto);
  
  // 4. تحديث البحث
  await researchRepository.update(research_id, {
    status: 'published',
    published_article_id: article.id,
    published_date: new Date()
  });
}
```

### 2. Issue Stats Auto-Update
```typescript
// تحديث تلقائي عند:
- إنشاء مقال جديد
- حذف مقال
- تغيير العدد للمقال

// في updateStats():
- حساب total_articles
- حساب total_pages من pages field
- حساب progress_percentage
```

### 3. Cloudinary Integration
```typescript
// Article Entity يدعم:
- pdf_url: الرابط الأساسي
- cloudinary_public_id: للتحكم
- cloudinary_secure_url: للأمان

// متوافق مع CloudinaryService الموجود
```

---

## ✅ Best Practices Implemented

### 1. **Entity Design**
- ✅ UUID Primary Keys
- ✅ Proper Indexes (single & composite)
- ✅ Enum Types للحالات
- ✅ JSON Fields للبيانات المرنة
- ✅ Timestamps (created_at, updated_at)
- ✅ Soft Relations مع Cascade

### 2. **Service Layer**
- ✅ Business Logic Separation
- ✅ Proper Error Handling
- ✅ Transaction Support (TypeORM)
- ✅ Query Optimization
- ✅ Statistics Calculation

### 3. **Controller Layer**
- ✅ JWT Authentication
- ✅ Role-Based Authorization
- ✅ DTO Validation
- ✅ UUID Pipe Validation
- ✅ Public Endpoints Support

### 4. **Validation**
- ✅ class-validator decorators
- ✅ Arabic error messages
- ✅ Proper constraints
- ✅ Type safety

### 5. **Security**
- ✅ Guards على كل endpoint
- ✅ Role checks
- ✅ Input validation
- ✅ Conflict detection

---

## 📦 Files Created

### Entities
```
/database/entities/
  ├── issue.entity.ts
  ├── article.entity.ts
  └── index.ts (updated)
```

### Issues Module
```
/modules/issues/
  ├── dto/
  │   ├── create-issue.dto.ts
  │   └── update-issue.dto.ts
  ├── issues.service.ts
  ├── issues.controller.ts
  └── issues.module.ts
```

### Articles Module
```
/modules/articles/
  ├── dto/
  │   ├── create-article.dto.ts
  │   └── update-article.dto.ts
  ├── articles.service.ts
  ├── articles.controller.ts
  └── articles.module.ts
```

### Configuration
```
/app/app.module.ts (updated)
```

---

## 🧪 Testing Recommendations

### Unit Tests
```typescript
describe('IssuesService', () => {
  it('should create issue');
  it('should publish issue');
  it('should update stats correctly');
  it('should prevent duplicate issue_number');
});

describe('ArticlesService', () => {
  it('should create article from research');
  it('should link research correctly');
  it('should prevent duplicate article_number');
  it('should search articles');
});
```

### Integration Tests
```typescript
describe('Issues API', () => {
  it('POST /api/issues (admin)');
  it('GET /api/issues/published (public)');
  it('PATCH /api/issues/:id/publish (editor)');
});

describe('Articles API', () => {
  it('POST /api/articles (admin)');
  it('GET /api/articles/search (public)');
  it('GET /api/articles/stats (editor)');
});
```

---

## 📊 Statistics & Metrics

### Issue Stats
- `total_articles` - عدد المقالات
- `total_pages` - مجموع الصفحات
- `views_count` - عدد المشاهدات
- `downloads_count` - عدد التحميلات
- `progress_percentage` - نسبة الإنجاز

### Article Stats
- `views_count` - عدد المشاهدات
- `downloads_count` - عدد التحميلات
- `citations_count` - عدد الاستشهادات

### Global Stats (via ArticlesService.getStats())
```typescript
{
  totalArticles: number
  publishedArticles: number
  readyToPublish: number
  totalViews: number
  totalDownloads: number
  totalCitations: number
}
```

---

## 🚀 Next Steps

### Frontend Integration
1. إنشاء `issues.service.ts` في Frontend
2. إنشاء `articles.service.ts` في Frontend
3. صفحات إدارة الأعداد (Admin/Editor)
4. صفحات إدارة المقالات (Admin/Editor)
5. صفحة عرض الأعداد (Public)
6. صفحة عرض المقالات (Public)
7. صفحة البحث في المقالات (Public)

### Database Migration
```bash
# سيتم إنشاء الجداول تلقائياً عند تشغيل التطبيق
npm run start:dev
```

### Postman Collection
إضافة endpoints جديدة:
- Issues folder
- Articles folder
- مع أمثلة للـ requests

---

## 📚 Related Documentation

- `DATABASE_SCHEMA.md` - Schema الكامل
- `BACKEND_API_SUMMARY.md` - ملخص API
- `CLOUDINARY_INTEGRATION.md` - تكامل Cloudinary
- `AUTH_INTEGRATION_README.md` - نظام المصادقة

---

## ✨ Summary

تم إنشاء **Issues** و **Articles** modules بشكل كامل مع:

✅ **Entities** - مع علاقات و indexes محسّنة  
✅ **DTOs** - مع validation كامل  
✅ **Services** - مع business logic شامل  
✅ **Controllers** - مع authorization و guards  
✅ **Integration** - مع Research و Cloudinary  
✅ **Best Practices** - NestJS standards  
✅ **Documentation** - شرح شامل  

**Status: Ready for Frontend Integration! 🎉**
