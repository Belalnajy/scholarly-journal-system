# 🔗 خطة ربط Frontend بـ Backend - Users Module

## 📅 **التاريخ:** 2025-10-21
## 👨‍💻 **المطور:** Belal
## 🎯 **الهدف:** ربط React Frontend بـ NestJS Backend للـ Users Module

---

## 📊 **نظرة عامة:**

سنقوم بإنشاء طبقة كاملة للتواصل مع Backend APIs، مع التركيز على:
- ✅ Type Safety (TypeScript)
- ✅ Error Handling
- ✅ Loading States
- ✅ Reusable Hooks
- ✅ Clean Architecture

---

## 🏗️ **الهيكل المعماري:**

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│                  (UsersPage, UserForm, etc.)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   Custom Hooks                               │
│         (useUsers, useUser, useUserMutations)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  Users Service                               │
│              (usersService.getAll(), etc.)                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   API Instance                               │
│          (axios with auth & error interceptors)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend API                                 │
│              (NestJS Controllers)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 **الخطوات التفصيلية:**

### **الخطوة 1: تحديث Types** ✅

**الملف:** `apps/frontend/src/types/user.types.ts`

**ما سنضيفه:**

#### 1.1 Academic Degree Enum
```typescript
export enum AcademicDegree {
  BACHELOR = 'bachelor',
  MASTER = 'master',
  PHD = 'phd',
  ASSISTANT_PROFESSOR = 'assistant-professor',
  ASSOCIATE_PROFESSOR = 'associate-professor',
  PROFESSOR = 'professor',
}
```

#### 1.2 User Status Enum
```typescript
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

#### 1.3 CreateUserDto
```typescript
export interface CreateUserDto {
  // Required fields
  email: string;
  password: string;
  name: string;
  
  // Optional basic fields
  phone?: string;
  role?: UserRole;
  
  // Profile info
  avatar_url?: string;
  affiliation?: string;
  department?: string;
  specialization?: string;
  academic_degree?: AcademicDegree;
  
  // Academic IDs
  orcid_id?: string;
  google_scholar_id?: string;
  research_gate_id?: string;
  
  // Additional info
  research_interests?: string;
  expertise_areas?: string;
  languages_spoken?: string;
  years_of_experience?: number;
  number_of_publications?: number;
  bio?: string;
}
```

#### 1.4 UpdateUserDto
```typescript
export interface UpdateUserDto {
  // All fields optional
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  
  // Profile info
  avatar_url?: string;
  affiliation?: string;
  department?: string;
  specialization?: string;
  academic_degree?: AcademicDegree;
  
  // Academic IDs
  orcid_id?: string;
  google_scholar_id?: string;
  research_gate_id?: string;
  
  // Additional info
  research_interests?: string;
  expertise_areas?: string;
  languages_spoken?: string;
  years_of_experience?: number;
  number_of_publications?: number;
  bio?: string;
}
```

#### 1.5 UserResponse (Full User Object)
```typescript
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  
  // Profile info
  avatar_url: string | null;
  affiliation: string | null;
  department: string | null;
  specialization: string | null;
  academic_degree: AcademicDegree | null;
  
  // Academic IDs
  orcid_id: string | null;
  google_scholar_id: string | null;
  research_gate_id: string | null;
  
  // Additional info
  research_interests: string | null;
  expertise_areas: string | null;
  languages_spoken: string | null;
  years_of_experience: number;
  number_of_publications: number;
  bio: string | null;
  
  // Status & timestamps
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}
```

#### 1.6 UserStats
```typescript
export interface UserStats {
  total: number;
  researchers: number;
  reviewers: number;
  editors: number;
  admins: number;
}
```

---

### **الخطوة 2: إنشاء Users Service** ✅

**الملف:** `apps/frontend/src/services/users.service.ts`

**الـ Endpoints:**

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/users` | إنشاء مستخدم جديد | CreateUserDto | UserResponse |
| GET | `/api/users` | جلب كل المستخدمين | - | UserResponse[] |
| GET | `/api/users/stats` | جلب الإحصائيات | - | UserStats |
| GET | `/api/users/:id` | جلب مستخدم واحد | - | UserResponse |
| PATCH | `/api/users/:id` | تحديث مستخدم | UpdateUserDto | UserResponse |
| DELETE | `/api/users/:id` | حذف مستخدم | - | void |

**الـ Functions:**

```typescript
export const usersService = {
  // 1. Get all users
  getAll: async (): Promise<UserResponse[]>
  
  // 2. Get user by ID
  getById: async (id: string): Promise<UserResponse>
  
  // 3. Create new user
  create: async (data: CreateUserDto): Promise<UserResponse>
  
  // 4. Update user
  update: async (id: string, data: UpdateUserDto): Promise<UserResponse>
  
  // 5. Delete user
  delete: async (id: string): Promise<void>
  
  // 6. Get statistics
  getStats: async (): Promise<UserStats>
}
```

**Error Handling:**
```typescript
try {
  const response = await api.get('/users');
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.message || 'حدث خطأ');
  }
  throw error;
}
```

---

### **الخطوة 3: إنشاء Custom Hooks** ✅

#### 3.1 useUsers Hook

**الملف:** `apps/frontend/src/hooks/useUsers.ts`

**الوظيفة:** جلب قائمة المستخدمين مع loading & error states

**الـ Interface:**
```typescript
interface UseUsersReturn {
  users: UserResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUsers(): UseUsersReturn
```

**الاستخدام:**
```typescript
const { users, loading, error, refetch } = useUsers();
```

---

#### 3.2 useUser Hook

**الملف:** `apps/frontend/src/hooks/useUser.ts`

**الوظيفة:** جلب مستخدم واحد بالـ ID

**الـ Interface:**
```typescript
interface UseUserReturn {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUser(id: string): UseUserReturn
```

**الاستخدام:**
```typescript
const { user, loading, error, refetch } = useUser(userId);
```

---

#### 3.3 useUserMutations Hook

**الملف:** `apps/frontend/src/hooks/useUserMutations.ts`

**الوظيفة:** عمليات Create, Update, Delete

**الـ Interface:**
```typescript
interface UseUserMutationsReturn {
  createUser: (data: CreateUserDto) => Promise<UserResponse>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<UserResponse>;
  deleteUser: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useUserMutations(): UseUserMutationsReturn
```

**الاستخدام:**
```typescript
const { createUser, updateUser, deleteUser, loading, error } = useUserMutations();

// Create
await createUser({ email, password, name });

// Update
await updateUser(userId, { name: 'New Name' });

// Delete
await deleteUser(userId);
```

---

#### 3.4 useUserStats Hook

**الملف:** `apps/frontend/src/hooks/useUserStats.ts`

**الوظيفة:** جلب إحصائيات المستخدمين

**الـ Interface:**
```typescript
interface UseUserStatsReturn {
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserStats(): UseUserStatsReturn
```

---

### **الخطوة 4: Error Handling & Notifications** ✅

**ما سنضيفه:**

#### 4.1 Error Messages (بالعربي)
```typescript
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالخادم',
  NOT_FOUND: 'المستخدم غير موجود',
  CONFLICT: 'البريد الإلكتروني مستخدم بالفعل',
  VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة',
  UNAUTHORIZED: 'يجب تسجيل الدخول أولاً',
  FORBIDDEN: 'ليس لديك صلاحية لهذا الإجراء',
  SERVER_ERROR: 'حدث خطأ في الخادم',
};
```

#### 4.2 Toast Notifications (اختياري)
```typescript
// Success
toast.success('تم إنشاء المستخدم بنجاح');

// Error
toast.error(error.message);

// Loading
toast.loading('جاري التحميل...');
```

---

### **الخطوة 5: اختبار Integration** ✅

**السيناريوهات:**

#### 5.1 Create User
```typescript
// Test data
const newUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: UserRole.RESEARCHER,
};

// Expected: UserResponse with id
```

#### 5.2 Get All Users
```typescript
// Expected: Array of UserResponse
// Should not include passwords
```

#### 5.3 Get User by ID
```typescript
// Expected: Single UserResponse
// 404 if not found
```

#### 5.4 Update User
```typescript
// Test data
const updates = {
  name: 'Updated Name',
  phone: '+201234567890',
};

// Expected: Updated UserResponse
```

#### 5.5 Delete User
```typescript
// Expected: void (204 No Content)
// 404 if not found
```

#### 5.6 Get Stats
```typescript
// Expected: UserStats object
{
  total: 10,
  researchers: 5,
  reviewers: 3,
  editors: 1,
  admins: 1
}
```

---

## 🔒 **Security Considerations:**

1. **Password Handling:**
   - ❌ لا نخزن passwords في Frontend
   - ❌ لا نعرض passwords في UI
   - ✅ نرسل password فقط عند Create/Update

2. **Token Management:**
   - ✅ Token يُضاف تلقائياً من `api.ts` interceptor
   - ✅ Auto-redirect للـ login عند 401

3. **Data Validation:**
   - ✅ Backend يعمل validation
   - ✅ Frontend يعرض validation errors

---

## 📦 **Dependencies:**

```json
{
  "axios": "^1.6.0",           // ✅ موجود
  "react": "^18.2.0",          // ✅ موجود
  "typescript": "^5.0.0"       // ✅ موجود
}
```

**Optional:**
```json
{
  "react-hot-toast": "^2.4.1",  // للـ notifications
  "react-query": "^3.39.3"      // للـ advanced caching
}
```

---

## 🎨 **مثال على Component:**

```typescript
// UsersPage.tsx
import { useUsers } from '../hooks/useUsers';
import { useUserMutations } from '../hooks/useUserMutations';

export function UsersPage() {
  const { users, loading, error, refetch } = useUsers();
  const { deleteUser } = useUserMutations();

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد؟')) {
      await deleteUser(id);
      await refetch(); // Refresh list
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      <h1>المستخدمون ({users.length})</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email} - {user.role}
            <button onClick={() => handleDelete(user.id)}>حذف</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🚀 **خطوات التنفيذ:**

- [ ] **Step 1:** تحديث `user.types.ts` بكل الـ Types
- [ ] **Step 2:** إنشاء `users.service.ts` مع كل الـ API calls
- [ ] **Step 3:** إنشاء `useUsers.ts` hook
- [ ] **Step 4:** إنشاء `useUser.ts` hook
- [ ] **Step 5:** إنشاء `useUserMutations.ts` hook
- [ ] **Step 6:** إنشاء `useUserStats.ts` hook
- [ ] **Step 7:** اختبار Integration مع Backend

---

## 📚 **المراجع:**

- [NestJS Tutorial](./NESTJS_TUTORIAL.md)
- [Backend Users Controller](./apps/backend/src/modules/users/users.controller.ts)
- [Backend DTOs](./apps/backend/src/modules/users/dto/)

---

## ✅ **Checklist:**

### Types
- [ ] AcademicDegree enum
- [ ] UserStatus enum
- [ ] CreateUserDto interface
- [ ] UpdateUserDto interface
- [ ] UserResponse interface
- [ ] UserStats interface

### Service
- [ ] getAll()
- [ ] getById()
- [ ] create()
- [ ] update()
- [ ] delete()
- [ ] getStats()

### Hooks
- [ ] useUsers
- [ ] useUser
- [ ] useUserMutations
- [ ] useUserStats

### Testing
- [ ] Create user works
- [ ] Get all users works
- [ ] Get user by ID works
- [ ] Update user works
- [ ] Delete user works
- [ ] Get stats works
- [ ] Error handling works
- [ ] Loading states work

---

**🎯 الهدف النهائي:** Frontend جاهز للتواصل مع Backend بشكل كامل مع type safety و error handling محترف!
