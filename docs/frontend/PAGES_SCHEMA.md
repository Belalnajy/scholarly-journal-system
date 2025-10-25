# 📋 Schema شامل لجميع صفحات التطبيق

## 🎯 نظرة عامة
هذا الملف يحتوي على Schema كامل لجميع الصفحات في التطبيق مع تفاصيل الـ Types والـ Interfaces المستخدمة.

---

## 📱 الصفحات العامة (Public Pages)

### 1. AboutPage
```typescript
interface AboutData {
  mission: string;
  vision: string;
  goals: string[];
  publicationFields: string[];
}
```

### 2. ContactPage
```typescript
interface ContactData {
  email: string;
  phone: string[];
  address: string;
  workingHours: string;
  mapLocation: {
    lat: number;
    lng: number;
  };
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
```

### 3. EditorialBoardPage
```typescript
interface EditorMember {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  specialization: string;
  category: 'editor-in-chief' | 'associate-editor' | 'editorial-board';
  image?: string;
  email?: string;
}

interface EditorialBoardData {
  members: EditorMember[];
  requirements: string[];
  joinInfo: string;
}
```

### 4. ForgotPasswordPage
```typescript
interface ForgotPasswordData {
  email: string;
}
```

### 5. IssueDetailsPage
```typescript
interface Issue {
  id: string;
  number: string;
  title: string;
  publishDate: string;
  coverImage?: string;
  stats: {
    totalArticles: number;
    totalPages: number;
    downloads: number;
    views: number;
  };
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  titleEn?: string;
  authors: string[];
  abstract: string;
  keywords: string[];
  pages: string;
  doi?: string;
  pdfUrl: string;
}
```

### 6. IssuesArchivePage
```typescript
interface IssueArchive {
  id: string;
  number: string;
  title: string;
  publishDate: string;
  coverImage?: string;
  articlesCount: number;
  downloads: number;
}

interface ArchiveFilters {
  year?: string;
  searchQuery?: string;
}

interface ArchiveStats {
  totalIssues: number;
  totalArticles: number;
  totalDownloads: number;
}
```

### 7. LandingPage
```typescript
interface HeroData {
  title: string;
  subtitle: string;
  ctaText: string;
}

interface ResearchPreview {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}
```

### 8. LoginPage
```typescript
interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface DemoAccount {
  role: 'researcher' | 'reviewer' | 'editor' | 'admin';
  email: string;
  password: string;
}
```

### 9. RegistrationPage
```typescript
interface RegistrationData {
  // Personal Info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Academic Info
  role: 'researcher' | 'reviewer';
  affiliation: string;
  department: string;
  specialization: string;
  academicDegree: string;
  
  // Additional Info
  orcidId?: string;
  researchInterests?: string;
  
  // Terms
  acceptTerms: boolean;
}
```

### 10. ResearchDetailsPage
```typescript
interface ResearchDetails {
  id: string;
  title: string;
  titleEn?: string;
  authors: Author[];
  abstract: string;
  abstractEn?: string;
  keywords: string[];
  keywordsEn?: string[];
  
  // Publication Info
  publishDate: string;
  issueNumber: string;
  pages: string;
  doi?: string;
  
  // Stats
  views: number;
  downloads: number;
  citations: number;
  
  // Files
  pdfUrl: string;
  
  // References
  references: Reference[];
}

interface Author {
  name: string;
  affiliation: string;
  email?: string;
  orcid?: string;
}

interface Reference {
  id: string;
  text: string;
  type: 'book' | 'article' | 'website' | 'other';
}
```

### 11. ResetPasswordPage
```typescript
interface ResetPasswordData {
  newPassword: string;
  confirmPassword: string;
  token: string;
}
```

### 12. VerifyCodePage
```typescript
interface VerifyCodeData {
  code: string; // 6 digits
  email: string;
}
```

---

## 🏠 Dashboard - الصفحات الرئيسية

### 1. DashboardPage (Router)
```typescript
interface DashboardRoute {
  path: string;
  element: React.ComponentType;
  roles: UserRole[];
}

type UserRole = 'researcher' | 'reviewer' | 'editor' | 'admin';
```

### 2. DashboardHomePage
```typescript
interface DashboardStats {
  totalResearch: number;
  underReview: number;
  activeResearchers: number;
  publishedResearch: number;
}

interface RecentActivity {
  id: string;
  type: 'submission' | 'review' | 'acceptance' | 'rejection';
  title: string;
  date: string;
  user: string;
}
```

### 3. AdminDashboard
```typescript
interface AdminStats {
  totalSubmissions: number;
  pendingReviews: number;
  activeReviewers: number;
  publishedThisMonth: number;
}

interface MonthlySubmission {
  month: string;
  submissions: number;
  accepted: number;
  rejected: number;
}

interface ResearchStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}
```

### 4. ResearcherDashboard
```typescript
interface ResearcherStats {
  submitted: number;
  underReview: number;
  accepted: number;
  rejected: number;
}

interface ResearcherResearch {
  id: string;
  title: string;
  status: 'under-review' | 'accepted' | 'needs-revision' | 'rejected';
  submissionDate: string;
  lastUpdate: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}
```

### 5. EditorDashboard
```typescript
interface EditorStats {
  pendingReview: number;
  underReview: number;
  pendingDecision: number;
  completedThisMonth: number;
  activeReviewers: number;
  averageReviewTime: number;
}

interface ResearchProgress {
  status: 'under-review' | 'pending' | 'needs-revision';
  count: number;
  percentage: number;
}

interface TopReviewer {
  id: string;
  name: string;
  completedReviews: number;
  averageRating: number;
  specialization: string;
}
```

### 6. ReviewerDashboard
```typescript
interface ReviewerStats {
  assignedTasks: number;
  completedReviews: number;
  averageRating: number;
  pendingTasks: number;
}

interface ReviewerTask {
  id: string;
  title: string;
  author: string;
  specialization: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}
```

---

## 👤 الصفحات المشتركة (Shared Pages)

### 1. ProfilePage
```typescript
interface UserProfile {
  // Basic Info
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  avatar?: string;
  
  // Academic Info
  specialization: string;
  university: string;
  department: string;
  academicDegree: 'bachelor' | 'master' | 'phd' | 'assistant-professor' | 'associate-professor' | 'professor';
  
  // Location
  country: string;
  city: string;
  address?: string;
  
  // Professional Info
  researchInterests: string;
  orcidId?: string;
  googleScholarId?: string;
  researchGateId?: string;
  
  // Additional Info
  yearsOfExperience: number;
  numberOfPublications: number;
  registrationDate: string;
  bio: string;
  
  // Role-specific
  expertiseAreas?: string; // for editors/reviewers
  languagesSpoken: string;
}
```

### 2. SettingsPage
```typescript
interface EmailSettings {
  newEmail: string;
}

interface PasswordSettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

### 3. NotificationsPage
```typescript
interface Notification {
  id: string;
  type: 'submission' | 'review' | 'decision' | 'message' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

type NotificationFilter = 'all' | 'unread' | 'read';
```

---

## 🔬 صفحات الباحث (Researcher Pages)

### 1. SubmitResearchPage
```typescript
interface ResearchSubmission {
  title: string;
  specialization: string;
  abstract: string;
  keywords: string;
  file: File | null;
}

const specializations = [
  'تكنولوجيا التعليم',
  'المناهج وطرق التدريس',
  'علم النفس التربوي',
  'الإدارة التربوية',
  'التربية الخاصة',
  'أصول التربية',
  'القياس والتقويم',
  'تقنيات التعليم',
];
```

### 2. MyResearchPage
```typescript
interface Research {
  id: string;
  title: string;
  status: 'under-review' | 'accepted' | 'needs-revision' | 'rejected';
  submissionDate: string;
  lastUpdate: string;
}

type ResearchFilter = 'all' | 'under-review' | 'accepted' | 'needs-revision' | 'rejected';
```

### 3. ViewResearchPage
```typescript
interface ResearchView {
  id: string;
  title: string;
  status: 'under-review' | 'accepted' | 'needs-revision' | 'rejected';
  submissionDate: string;
  lastUpdate: string;
  specialization: string;
  abstract: string;
  keywords: string[];
  fileName: string;
  fileSize: string;
}
```

### 4. ReviseResearchPage
```typescript
interface ResearchRevision {
  researchId: string;
  title: string;
  reviewerName: string;
  reviewerComment: string;
  currentFile: string;
  
  // Revision data
  notes: string;
  file: File | null;
}
```

---

## 👨‍⚖️ صفحات المحكم (Reviewer Pages)

### 1. MyTasksPage
```typescript
interface ReviewerTask {
  id: string;
  title: string;
  description: string;
  author: string;
  specialization: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

type TaskFilter = 'all' | 'pending' | 'in-progress' | 'completed';
```

### 2. EvaluationFormPage
```typescript
interface EvaluationCriteria {
  id: string;
  title: string;
  rating: number; // 1-5
}

interface ResearchEvaluation {
  researchId: string;
  criteria: EvaluationCriteria[];
  generalComments: string;
  recommendation: 'accepted' | 'needs-revision' | 'rejected';
  averageRating: number;
}

interface ResearchInfo {
  id: string;
  title: string;
  author: string;
  researchNumber: string;
  specialization: string;
}

// Default criteria
const defaultCriteria = [
  'وضوح العنوان',
  'جودة المنهجية',
  'أصالة الفكرة',
  'سلامة اللغة',
  'المراجع المستخدمة',
  'جودة العرض العام',
];
```

### 3. CompletedResearchPage
```typescript
interface CompletedResearch {
  id: string;
  title: string;
  description: string;
  author: string;
  specialization: string;
  submissionDate: string;
  evaluationDate: string;
  status: 'accepted' | 'needs-revision' | 'rejected';
}

type CompletedFilter = 'all' | 'accepted' | 'needs-revision' | 'rejected';
```

### 4. ReviewDetailsPage
```typescript
interface ReviewDetails {
  id: string;
  title: string;
  description: string;
  author: string;
  specialization: string;
  submissionDate: string;
  status: 'accepted' | 'needs-revision' | 'rejected';
  needsReReview: boolean;
  revisionNote?: string;
}

interface ReviewerComment {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ActivityLog {
  id: string;
  action: string;
  date: string;
  icon: 'send' | 'start' | 'complete-1' | 'complete-2';
}
```

---

## 📝 صفحات المحرر (Editor Pages)

### 1. ManageResearchPage
```typescript
interface ResearchItem {
  id: string;
  researchNumber: string;
  title: string;
  author: string;
  submissionDate: string;
  status: StatusType;
  reviewers: string[];
  evaluationDate?: string;
}

type StatusType = 
  | 'under-review'      // تحت المراجعة
  | 'pending'           // في انتظار القرار ⭐
  | 'needs-revision'    // يتطلب تعديل
  | 'accepted'          // مقبول
  | 'rejected'          // مرفوض
  | 'ready-to-publish'  // جاهز للنشر
  | 'published'         // منشور
  | 'in-progress';      // قيد التحضير
```

### 2. EditorResearchDetailsPage
```typescript
interface ResearchDetails {
  id: string;
  researchNumber: string;
  title: string;
  titleEn?: string;
  abstract: string;
  keywords: string[];
  author: {
    name: string;
    email: string;
    affiliation: string;
    specialization: string;
  };
  submissionDate: string;
  status: StatusType;
  reviewers: string[];
  evaluationDate?: string;
  timeline: {
    submitted: string;
    underReview?: string;
    evaluated?: string;
  };
}
```

### 3. EditorReviewDetailsPage
```typescript
interface ResearchReviewDetails {
  id: string;
  researchNumber: string;
  title: string;
  titleEn?: string;
  abstract: string;
  author: {
    name: string;
    email: string;
    affiliation: string;
    specialization: string;
  };
  submissionDate: string;
  status: StatusType;
  evaluationDate: string;
  reviewers: ReviewerComment[];
  averageRating: number;
}

interface ReviewerComment {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  recommendation: 'accepted' | 'rejected' | 'needs-revision';
}
```

### 4. PendingRevisionDetailsPage
```typescript
interface PendingRevisionDetails {
  id: string;
  researchNumber: string;
  title: string;
  titleEn?: string;
  abstract: string;
  author: {
    name: string;
    email: string;
    affiliation: string;
    specialization: string;
  };
  submissionDate: string;
  status: StatusType;
  evaluationDate: string;
  reviewers: ReviewerComment[];
  averageRating: number;
  revisionStatus: 'waiting-for-revision' | 'revision-submitted';
  revisionDeadline?: string;
  revisionSubmittedDate?: string;
}
```

### 5. PendingDecisionPage
```typescript
interface PendingDecisionDetails {
  id: string;
  researchNumber: string;
  title: string;
  titleEn?: string;
  abstract: string;
  author: {
    name: string;
    email: string;
    affiliation: string;
    specialization: string;
  };
  submissionDate: string;
  status: StatusType;
  evaluationDate: string;
  reviewers: ReviewerComment[];
  averageRating: number;
}

interface EditorDecision {
  researchId: string;
  decision: 'accepted' | 'needs-revision' | 'rejected';
  editorNotes: string;
}
```

### 6. AssignReviewerPage
```typescript
interface ResearchInfo {
  id: string;
  researchNumber: string;
  title: string;
  author: string;
  specialization: string;
  submissionDate: string;
  keywords: string[];
}

interface Reviewer {
  id: string;
  name: string;
  specialization: string;
  completedReviews: number;
  availability: 'available' | 'busy' | 'unavailable';
}

interface ReviewerAssignment {
  researchId: string;
  reviewers: string[];
  deadline: string;
  notes: string;
}
```

### 7. ManageReviewersPage
```typescript
interface Reviewer {
  id: string;
  name: string;
  specialization: string;
  email: string;
  orcid?: string;
  university: string;
  status: 'active' | 'busy' | 'inactive';
  completedReviews: number;
  activeReviews: number;
  bio: string;
  interests: string[];
}

interface ReviewerStats {
  total: number;
  active: number;
  averageTime: number;
}
```

### 8. ManageReportsPage
```typescript
interface ReviewReport {
  id: string;
  researchNumber: string;
  researchTitle: string;
  author: string;
  submissionDate: string;
  evaluationDate?: string;
  status: StatusType;
  reviewersCount: number;
  completedReviews: number;
  averageRating: number;
}

interface ReportStats {
  totalReports: number;
  averageScore: number;
  pendingDecisions: number;
  completedReports: number;
}
```

### 9. ManageIssuesPage
```typescript
interface Issue {
  id: string;
  number: string;
  title: string;
  description: string;
  publishDate: string;
  maxArticles: number;
  status: 'published' | 'in-progress' | 'planned';
  progress: number;
  articles: Article[];
}

interface Article {
  id: string;
  title: string;
  author: string;
  status: 'published' | 'in-progress';
}

interface IssueFormData {
  number: string;
  title: string;
  description: string;
  publishDate: string;
  maxArticles: string;
}

interface IssueStats {
  published: number;
  inProgress: number;
  planned: number;
}
```

### 10. ManageArticlesPage
```typescript
interface Article {
  id: string;
  articleNumber: string;
  title: string;
  author: string;
  status: StatusType;
  issueNumber: string;
  publishDate: string;
}

interface ArticleStats {
  total: number;
  published: number;
  readyToPublish: number;
  inProgress: number;
}
```

---

## 👨‍💼 صفحات المدير (Admin Pages)

### 1. ManageUsersPage
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'researcher' | 'reviewer' | 'editor' | 'admin';
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
}

interface UserStats {
  researchers: number;
  reviewers: number;
  editors: number;
}
```

### 2. AddUserPage
```typescript
interface NewUserData {
  // Basic Info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'researcher' | 'reviewer' | 'editor';
  
  // Additional Info
  affiliation: string;
  phone: string;
  specialization: string;
}
```

### 3. ReportsStatisticsPage
```typescript
interface SystemStats {
  acceptanceRate: number;
  rejectionRate: number;
  averageReviewTime: number;
  totalSubmissions: number;
  publishedResearch: number;
}

interface MonthlyData {
  month: string;
  days?: number;
  value?: number;
}

interface ChartData {
  monthlyReviewTime: MonthlyData[];
  monthlyProductivity: MonthlyData[];
}
```

---

## 🎨 Shared Types & Enums

### Status Types
```typescript
type StatusType = 
  | 'under-review'      // تحت المراجعة
  | 'pending'           // في انتظار القرار
  | 'needs-revision'    // يتطلب تعديل
  | 'accepted'          // مقبول
  | 'rejected'          // مرفوض
  | 'ready-to-publish'  // جاهز للنشر
  | 'published'         // منشور
  | 'in-progress';      // قيد التحضير

type UserRole = 'researcher' | 'reviewer' | 'editor' | 'admin';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

type AcademicDegree = 
  | 'bachelor' 
  | 'master' 
  | 'phd' 
  | 'assistant-professor' 
  | 'associate-professor' 
  | 'professor';
```

### Common Interfaces
```typescript
interface Author {
  name: string;
  affiliation: string;
  email?: string;
  orcid?: string;
}

interface FileInfo {
  name: string;
  size: string;
  type: string;
  url: string;
}

interface DateRange {
  from: string;
  to: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

interface SearchFilters {
  query?: string;
  status?: StatusType;
  dateRange?: DateRange;
  specialization?: string;
}
```

---

## 📊 API Response Types

### Success Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
```

### Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Paginated Response
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 🔐 Authentication Types

```typescript
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
}
```

---

## 📝 Form Validation Rules

```typescript
interface ValidationRules {
  email: {
    required: true;
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  };
  password: {
    required: true;
    minLength: 8;
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  };
  phone: {
    pattern: /^(\+966|00966|0)?5\d{8}$/;
  };
  orcid: {
    pattern: /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
  };
}
```

---

## 🎯 Constants

```typescript
const SPECIALIZATIONS = [
  'تكنولوجيا التعليم',
  'المناهج وطرق التدريس',
  'علم النفس التربوي',
  'الإدارة التربوية',
  'التربية الخاصة',
  'أصول التربية',
  'القياس والتقويم',
  'تقنيات التعليم',
] as const;

const ACADEMIC_DEGREES = [
  'بكالوريوس',
  'ماجستير',
  'دكتوراه',
  'أستاذ مساعد',
  'أستاذ مشارك',
  'أستاذ',
] as const;

const FILE_UPLOAD_LIMITS = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['application/pdf'],
  avatarMaxSize: 5 * 1024 * 1024, // 5MB
  avatarAllowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
} as const;
```

---

## 📚 ملاحظات مهمة

### 1. جميع التواريخ بصيغة ISO 8601
```typescript
// مثال: "2024-01-15T10:30:00Z"
```

### 2. جميع الملفات يجب أن تكون PDF
```typescript
// للأبحاث والمرفقات
accept: "application/pdf"
```

### 3. التقييمات من 1 إلى 5
```typescript
// Star Rating: 1 (ضعيف) إلى 5 (ممتاز)
rating: number; // 1-5
```

### 4. جميع النصوص تدعم العربية والإنجليزية
```typescript
interface BilingualText {
  ar: string;
  en?: string;
}
```

---

## 🔄 State Management

```typescript
// Auth Context
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// Notification Context
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}
```

---

## 🎨 Theme Colors

```typescript
const THEME_COLORS = {
  primary: '#0D3B66',      // الأزرق الداكن
  secondary: '#C9A961',    // الذهبي
  success: '#10b981',      // الأخضر
  warning: '#f59e0b',      // البرتقالي
  error: '#ef4444',        // الأحمر
  info: '#3b82f6',         // الأزرق
} as const;
```

---

**📅 آخر تحديث:** 2025-10-21  
**📝 الإصدار:** 1.0.0  
**✍️ المطور:** Belal
