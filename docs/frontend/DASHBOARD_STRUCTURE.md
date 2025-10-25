# هيكل صفحات Dashboard

تم إعادة تنظيم صفحات الـ Dashboard بشكل واضح ومنظم حسب الأدوار (Roles) والصفحات المشتركة.

## 📁 الهيكل الجديد

```
apps/frontend/src/pages/dashboard/
├── DashboardPage.tsx          # الصفحة الرئيسية للـ Dashboard (Router)
├── index.ts                   # ملف الـ exports الرئيسي
│
├── researcher/                # صفحات الباحث (Researcher)
│   ├── index.ts
│   ├── ResearcherDashboard.tsx
│   ├── SubmitResearchPage.tsx
│   ├── MyResearchPage.tsx
│   ├── ViewResearchPage.tsx
│   └── ReviseResearchPage.tsx
│
├── reviewer/                  # صفحات المحكم (Reviewer)
│   ├── index.ts
│   ├── ReviewerDashboard.tsx
│   ├── MyTasksPage.tsx
│   ├── EvaluationFormPage.tsx
│   ├── CompletedResearchPage.tsx
│   └── ReviewerResearchViewPage.tsx
│
├── editor-admin/              # صفحات مشتركة بين المحرر والمدير
│   ├── index.ts
│   ├── ManageResearchPage.tsx
│   ├── EditorResearchDetailsPage.tsx
│   ├── PendingRevisionDetailsPage.tsx
│   ├── PendingDecisionPage.tsx
│   ├── AssignReviewerPage.tsx
│   ├── ManageReviewersPage.tsx
│   ├── EditorReviewDetailsPage.tsx
│   ├── ReviewDetailsPage.tsx
│   ├── ManageIssuesPage.tsx
│   ├── AddArticleToIssuePage.tsx
│   ├── EditIssuePage.tsx
│   ├── ViewIssueArticlesPage.tsx
│   ├── ManageReportsPage.tsx
│   ├── ManageArticlesPage.tsx
│   ├── ArticleDetailsPage.tsx
│   └── EditArticlePage.tsx
│
├── admin/                     # صفحات المدير فقط (Admin Only)
│   ├── index.ts
│   ├── AdminDashboard.tsx
│   ├── ManageUsersPage.tsx
│   ├── AddUserPage.tsx
│   ├── EditUserPage.tsx
│   ├── ManageContactSubmissionsPage.tsx
│   ├── ReportsStatisticsPage.tsx
│   └── SiteSettingsPage.tsx
│
└── shared/                    # صفحات مشتركة بين جميع الأدوار
    ├── index.ts
    ├── DashboardHomePage.tsx
    ├── EditorDashboard.tsx
    ├── ProfilePage.tsx
    ├── NotificationsPage.tsx
    └── SettingsPage.tsx
```

## 🎯 توزيع الصفحات حسب الأدوار

### 1️⃣ Researcher (الباحث)

**الصفحات الخاصة:**

- `ResearcherDashboard` - لوحة تحكم الباحث
- `SubmitResearchPage` - تقديم بحث جديد
- `MyResearchPage` - أبحاثي
- `ViewResearchPage` - عرض تفاصيل البحث
- `ReviseResearchPage` - تعديل البحث بعد المراجعة

**الصفحات المشتركة:**

- Profile, Notifications, Settings

---

### 2️⃣ Reviewer (المحكم)

**الصفحات الخاصة:**

- `ReviewerDashboard` - لوحة تحكم المحكم
- `MyTasksPage` - مهامي (الأبحاث المطلوب تحكيمها)
- `EvaluationFormPage` - نموذج التحكيم
- `CompletedResearchPage` - الأبحاث المكتملة
- `ReviewerResearchViewPage` - عرض البحث للمحكم

**الصفحات المشتركة:**

- Profile, Notifications, Settings

---

### 3️⃣ Editor (المحرر)

**الصفحات الخاصة:**

- `EditorDashboard` - لوحة تحكم المحرر

**الصفحات المشتركة مع Admin:**

- إدارة الأبحاث والمراجعين
- إدارة الأعداد والمقالات
- إدارة التقارير
- تعيين المحكمين

**الصفحات المشتركة:**

- Profile, Notifications, Settings

---

### 4️⃣ Admin (المدير)

**الصفحات الخاصة:**

- `AdminDashboard` - لوحة تحكم المدير
- `ManageUsersPage` - إدارة المستخدمين
- `AddUserPage` - إضافة مستخدم
- `EditUserPage` - تعديل مستخدم
- `ManageContactSubmissionsPage` - رسائل التواصل
- `ReportsStatisticsPage` - التقارير والإحصاءات
- `SiteSettingsPage` - إعدادات الموقع

**الصفحات المشتركة مع Editor:**

- جميع صفحات `editor-admin/`

**الصفحات المشتركة:**

- Profile, Notifications, Settings

---

## 📝 ملاحظات مهمة

### Imports

- جميع الـ imports تم تحديثها تلقائياً
- الـ imports النسبية تم تعديلها من `../../` إلى `../../../`
- يمكن استيراد الصفحات من الملف الرئيسي:
  ```typescript
  import { ResearcherDashboard, MyTasksPage } from './pages/dashboard';
  ```

### Routes

- جميع الـ routes موجودة في `DashboardPage.tsx`
- الـ routes محمية بـ `ProtectedRoute` حسب الأدوار
- الصفحات المشتركة بين Editor و Admin تستخدم:
  ```typescript
  <ProtectedRoute allowedRoles={[UserRole.EDITOR, UserRole.ADMIN]}>
  ```
  t

### فوائد الهيكل الجديد

1. **وضوح الهيكل**: سهولة معرفة أي صفحة تخص أي role
2. **سهولة الصيانة**: كل role في مجلد منفصل
3. **تجنب التكرار**: الصفحات المشتركة في مجلدات واضحة
4. **قابلية التوسع**: سهولة إضافة صفحات جديدة لأي role
5. **تنظيم الكود**: كل مجلد له `index.ts` خاص به

---

## 🔄 التحديثات المطلوبة عند إضافة صفحة جديدة

1. أضف الملف في المجلد المناسب
2. أضف export في `index.ts` الخاص بالمجلد
3. أضف الـ route في `DashboardPage.tsx`
4. أضف الـ navigation item في `dashboardNavigation.ts` (إذا لزم الأمر)

---

تم إنشاء هذا الهيكل في: 2025-10-23
