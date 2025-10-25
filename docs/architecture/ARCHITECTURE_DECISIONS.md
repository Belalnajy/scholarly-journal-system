# 🏗️ Architecture Decisions - قرارات معمارية مهمة

## 📋 Table of Contents
1. [Research vs Article Design](#research-vs-article-design)
2. [Status Flow](#status-flow)
3. [Publication Workflow](#publication-workflow)
4. [Data Relationships](#data-relationships)

---

## 1️⃣ Research vs Article Design

### ❓ **السؤال:**
> هل البحث المقبول يتحول إلى Article ويختفي؟  
> أم نحتفظ بالـ Research ونُنشئ Article جديد؟

### ✅ **القرار: نحتفظ بالاثنين (Research + Article)**

### 📊 **التصميم:**

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE DESIGN                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐                    ┌──────────────────┐
│     RESEARCH     │                    │     ARTICLE      │
│                  │                    │                  │
│  id: UUID        │◄───────────────────│  id: UUID        │
│  user_id: UUID   │                    │  research_id: UK │
│  title: string   │                    │  issue_id: UUID  │
│  abstract: text  │                    │  title: string   │
│  status: enum    │                    │  authors: json   │
│  published_      │                    │  doi: string     │
│    article_id ───┼───────────────────►│  pdf_url: text   │
│                  │                    │  published_date  │
│  submission_date │                    │  views_count     │
│  evaluation_date │                    │  downloads_count │
│  published_date  │                    │  citations_count │
└──────────────────┘                    └──────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
   "Submission                              "Published
    & Review                                 Content"
    Process"                                 
```

### 🎯 **الأسباب:**

#### **1. Separation of Concerns**
```typescript
// Research = عملية التقديم والمراجعة
interface Research {
  submission_date: Date;
  evaluation_date: Date;
  reviews: Review[];
  revisions: Revision[];
  status: 'under-review' | 'accepted' | 'rejected';
}

// Article = المحتوى المنشور
interface Article {
  published_date: Date;
  issue_id: string;
  doi: string;
  views_count: number;
  downloads_count: number;
  citations_count: number;
}
```

#### **2. Data Integrity**
- البحث الأصلي محفوظ مع كل تاريخه
- المقال المنشور قد يحتوي تعديلات نهائية
- يمكن سحب المقال دون فقدان البحث الأصلي

#### **3. Audit Trail**
```sql
-- تتبع رحلة البحث كاملة
SELECT 
    r.research_number,
    r.submission_date,
    r.evaluation_date,
    r.status,
    a.article_number,
    a.published_date,
    i.issue_number
FROM research r
LEFT JOIN articles a ON r.published_article_id = a.id
LEFT JOIN issues i ON a.issue_id = i.id
WHERE r.id = $1;
```

#### **4. Flexibility**
```typescript
// Scenario 1: رفض البحث
research.status = 'rejected';
// لا يُنشأ Article

// Scenario 2: قبول البحث
research.status = 'accepted';
// لا يُنشأ Article بعد (ينتظر إضافته لعدد)

// Scenario 3: نشر البحث في عدد
research.status = 'published';
article = createArticleFromResearch(research);
research.published_article_id = article.id;

// Scenario 4: سحب المقال
article.status = 'withdrawn';
research.status = 'accepted'; // يعود لحالة مقبول
research.published_article_id = null;
```

#### **5. Statistics & Reporting**
```sql
-- إحصائيات الأبحاث المقدمة
SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'under-review') as under_review,
    COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE status = 'published') as published
FROM research;

-- إحصائيات المقالات المنشورة
SELECT 
    COUNT(*) as total_articles,
    SUM(views_count) as total_views,
    SUM(downloads_count) as total_downloads,
    SUM(citations_count) as total_citations
FROM articles;

-- معدل القبول
SELECT 
    (COUNT(*) FILTER (WHERE status IN ('accepted', 'published'))::float / 
     COUNT(*)::float * 100) as acceptance_rate
FROM research;
```

---

## 2️⃣ Status Flow

### 📊 **Research Status Flow:**

```
┌─────────────┐
│  SUBMITTED  │ ← الباحث يقدم البحث
└──────┬──────┘
       │
       ▼
┌─────────────┐
│UNDER-REVIEW │ ← المحكمون يراجعون
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   PENDING   │ │NEEDS-REVISION│ │  REJECTED   │
│  (Decision) │ │             │ │             │
└──────┬──────┘ └──────┬──────┘ └─────────────┘
       │               │
       │               ▼
       │        ┌─────────────┐
       │        │  REVISION   │
       │        │  SUBMITTED  │
       │        └──────┬──────┘
       │               │
       │               ▼
       │        ┌─────────────┐
       │        │UNDER-REVIEW │
       │        │   (Again)   │
       │        └──────┬──────┘
       │               │
       ▼               ▼
┌─────────────┐ ┌─────────────┐
│  ACCEPTED   │◄┤  ACCEPTED   │
└──────┬──────┘ └─────────────┘
       │
       ▼
┌─────────────┐
│  PUBLISHED  │ ← تم إنشاء Article وإضافته لعدد
└─────────────┘
```

### 🔄 **Article Status Flow:**

```
┌─────────────────┐
│ READY-TO-PUBLISH│ ← تم إنشاء Article من Research مقبول
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PUBLISHED     │ ← تم إضافته لعدد ونشره
└────────┬────────┘
         │
         ├──────────────┐
         ▼              ▼
┌─────────────────┐ ┌─────────────────┐
│   ACTIVE        │ │   WITHDRAWN     │
│  (Normal State) │ │  (سحب المقال)   │
└─────────────────┘ └─────────────────┘
```

---

## 3️⃣ Publication Workflow

### 📝 **الخطوات التفصيلية:**

#### **Step 1: قبول البحث**
```typescript
async function acceptResearch(researchId: string, editorId: string) {
  // 1. Update research status
  await db.query(`
    UPDATE research 
    SET 
      status = 'accepted',
      evaluation_date = NOW()
    WHERE id = $1
  `, [researchId]);
  
  // 2. Notify researcher
  await createNotification({
    userId: research.user_id,
    type: 'decision',
    title: 'تم قبول البحث',
    message: 'تهانينا! تم قبول بحثك للنشر',
    actionUrl: `/dashboard/view-research/${researchId}`
  });
  
  // 3. Log activity
  await logActivity({
    userId: editorId,
    researchId,
    actionType: 'research_accepted',
    description: 'تم قبول البحث من قبل المحرر'
  });
}
```

#### **Step 2: إضافة البحث لعدد معين**
```typescript
async function publishResearchToIssue(
  researchId: string, 
  issueId: string,
  editorId: string
) {
  // 1. Validate
  const research = await getResearch(researchId);
  if (research.status !== 'accepted') {
    throw new Error('Research must be accepted first');
  }
  
  const issue = await getIssue(issueId);
  if (issue.total_articles >= issue.max_articles) {
    throw new Error('Issue is full');
  }
  
  // 2. Create Article from Research
  const articleNumber = await generateArticleNumber(issueId);
  const doi = await generateDOI(articleNumber);
  
  const article = await db.query(`
    INSERT INTO articles (
      research_id,
      issue_id,
      article_number,
      title,
      title_en,
      authors,
      abstract,
      abstract_en,
      keywords,
      keywords_en,
      pdf_url,
      doi,
      published_date,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), 'published')
    RETURNING *
  `, [
    researchId,
    issueId,
    articleNumber,
    research.title,
    research.title_en,
    buildAuthorsJson(research),
    research.abstract,
    research.abstract_en,
    research.keywords,
    research.keywords_en,
    research.pdf_url,
    doi
  ]);
  
  // 3. Update Research
  await db.query(`
    UPDATE research 
    SET 
      status = 'published',
      published_article_id = $1,
      published_date = NOW()
    WHERE id = $2
  `, [article.id, researchId]);
  
  // 4. Update Issue Stats
  await db.query(`
    UPDATE issues
    SET 
      total_articles = total_articles + 1,
      progress_percentage = (total_articles * 100 / max_articles)
    WHERE id = $1
  `, [issueId]);
  
  // 5. Notify researcher
  await createNotification({
    userId: research.user_id,
    type: 'publication',
    title: 'تم نشر بحثك',
    message: `تم نشر بحثك في العدد ${issue.issue_number}`,
    actionUrl: `/research/${article.article_number}`
  });
  
  // 6. Log activity
  await logActivity({
    userId: editorId,
    researchId,
    actionType: 'research_published',
    description: `تم نشر البحث في العدد ${issue.issue_number}`,
    metadata: { articleId: article.id, issueId }
  });
  
  return article;
}
```

#### **Step 3: عرض المقال المنشور**
```typescript
async function getPublishedArticle(articleId: string) {
  const result = await db.query(`
    SELECT 
      a.*,
      i.issue_number,
      i.publish_date as issue_publish_date,
      r.research_number,
      r.submission_date,
      r.evaluation_date,
      u.name as researcher_name,
      u.email as researcher_email
    FROM articles a
    JOIN issues i ON a.issue_id = i.id
    JOIN research r ON a.research_id = r.id
    JOIN users u ON r.user_id = u.id
    WHERE a.id = $1
  `, [articleId]);
  
  return result.rows[0];
}
```

---

## 4️⃣ Data Relationships

### 🔗 **العلاقات الكاملة:**

```
┌──────────┐
│   USER   │
└────┬─────┘
     │
     │ submits (1:N)
     ▼
┌──────────┐         ┌──────────┐
│ RESEARCH │◄────────│  REVIEW  │
└────┬─────┘         └──────────┘
     │                     ▲
     │ becomes (1:1)       │ performs (1:N)
     ▼                     │
┌──────────┐         ┌──────────┐
│ ARTICLE  │         │   USER   │
└────┬─────┘         │(Reviewer)│
     │               └──────────┘
     │ published_in (N:1)
     ▼
┌──────────┐
│  ISSUE   │
└──────────┘
```

### 📊 **Cardinality:**

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Research | 1:N | مستخدم واحد يقدم عدة أبحاث |
| Research → Review | 1:N | بحث واحد له عدة مراجعات |
| User → Review | 1:N | محكم واحد يراجع عدة أبحاث |
| Research → Article | 1:1 | بحث مقبول يصبح مقال واحد |
| Article → Research | 1:1 | مقال واحد من بحث واحد |
| Issue → Article | 1:N | عدد واحد يحتوي عدة مقالات |
| Article → Issue | N:1 | عدة مقالات في عدد واحد |

### 🔍 **Bidirectional Links:**

```sql
-- Research → Article
research.published_article_id → article.id

-- Article → Research
article.research_id → research.id
```

**لماذا Bidirectional؟**
1. **من Research للـ Article**: لمعرفة إذا كان البحث منشور
2. **من Article للـ Research**: للرجوع للبحث الأصلي وتاريخه

---

## 5️⃣ Query Examples

### **1. Get Research Journey**
```sql
-- رحلة البحث من التقديم للنشر
SELECT 
    r.research_number,
    r.title,
    r.submission_date,
    r.evaluation_date,
    r.published_date,
    r.status,
    r.average_rating,
    COUNT(rev.id) as total_reviews,
    a.article_number,
    a.doi,
    i.issue_number,
    i.publish_date
FROM research r
LEFT JOIN reviews rev ON r.id = rev.research_id
LEFT JOIN articles a ON r.published_article_id = a.id
LEFT JOIN issues i ON a.issue_id = i.id
WHERE r.id = $1
GROUP BY r.id, a.id, i.id;
```

### **2. Get Issue Contents**
```sql
-- محتويات العدد
SELECT 
    i.issue_number,
    i.title,
    i.publish_date,
    json_agg(
        json_build_object(
            'article_number', a.article_number,
            'title', a.title,
            'authors', a.authors,
            'pages', a.pages,
            'doi', a.doi,
            'views', a.views_count,
            'downloads', a.downloads_count,
            'original_research', r.research_number
        ) ORDER BY a.article_number
    ) as articles
FROM issues i
LEFT JOIN articles a ON i.id = a.issue_id
LEFT JOIN research r ON a.research_id = r.id
WHERE i.id = $1
GROUP BY i.id;
```

### **3. Researcher Statistics**
```sql
-- إحصائيات الباحث
SELECT 
    u.name,
    COUNT(r.id) as total_submissions,
    COUNT(r.id) FILTER (WHERE r.status = 'under-review') as under_review,
    COUNT(r.id) FILTER (WHERE r.status = 'accepted') as accepted,
    COUNT(r.id) FILTER (WHERE r.status = 'published') as published,
    COUNT(r.id) FILTER (WHERE r.status = 'rejected') as rejected,
    COUNT(a.id) as total_articles,
    COALESCE(SUM(a.views_count), 0) as total_views,
    COALESCE(SUM(a.downloads_count), 0) as total_downloads,
    COALESCE(SUM(a.citations_count), 0) as total_citations
FROM users u
LEFT JOIN research r ON u.id = r.user_id
LEFT JOIN articles a ON r.published_article_id = a.id
WHERE u.id = $1
GROUP BY u.id;
```

---

## 📝 Summary

### ✅ **القرارات الرئيسية:**

1. **Research ≠ Article**
   - Research: عملية التقديم والمراجعة
   - Article: المحتوى المنشور

2. **Bidirectional Relationship**
   - Research → Article (published_article_id)
   - Article → Research (research_id)

3. **Status Separation**
   - Research Status: under-review, pending, needs-revision, accepted, rejected, published
   - Article Status: ready-to-publish, published, withdrawn

4. **Data Integrity**
   - الحفاظ على البحث الأصلي
   - إمكانية سحب المقال
   - Audit Trail كامل

5. **Flexibility**
   - رفض البحث دون إنشاء Article
   - قبول البحث دون نشره فوراً
   - نشر البحث في أي عدد
   - سحب المقال مع الحفاظ على البحث

---

**📅 آخر تحديث:** 2025-10-21  
**📝 الإصدار:** 1.0.0  
**✍️ المطور:** Belal  
**👨‍💼 Role:** Software Architect & Team Leader
