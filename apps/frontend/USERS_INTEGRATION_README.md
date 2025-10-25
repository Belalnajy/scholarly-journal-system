# 🔗 Users Integration - Frontend

## ✅ **ما تم إنجازه:**

تم ربط Frontend بـ Backend بشكل كامل للـ Users Module مع:
- ✅ Type Safety كامل (TypeScript)
- ✅ Error Handling بالعربي
- ✅ Loading States
- ✅ Reusable Hooks
- ✅ Clean Architecture

---

## 📁 **الملفات المُنشأة:**

### **1. Types** (`src/types/user.types.ts`)
```typescript
// Enums
- UserRole
- AcademicDegree
- UserStatus

// DTOs
- CreateUserDto
- UpdateUserDto

// Response Types
- UserResponse
- UserStats
```

### **2. Service** (`src/services/users.service.ts`)
```typescript
usersService.getAll()      // GET /api/users
usersService.getById(id)   // GET /api/users/:id
usersService.create(data)  // POST /api/users
usersService.update(id, data) // PATCH /api/users/:id
usersService.delete(id)    // DELETE /api/users/:id
usersService.getStats()    // GET /api/users/stats
```

### **3. Hooks** (`src/hooks/`)
```typescript
useUsers()           // جلب قائمة المستخدمين
useUser(id)          // جلب مستخدم واحد
useUserMutations()   // عمليات Create, Update, Delete
useUserStats()       // جلب الإحصائيات
```

### **4. Example** (`src/examples/UsersExample.tsx`)
مثال كامل لاستخدام الـ hooks

---

## 🚀 **كيفية الاستخدام:**

### **1. استخدام useUsers (جلب قائمة المستخدمين)**

```typescript
import { useUsers } from '../hooks';

function UsersPage() {
  const { users, loading, error, refetch } = useUsers();

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      <h1>المستخدمون ({users.length})</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email} - {user.role}
          </li>
        ))}
      </ul>
      <button onClick={refetch}>تحديث</button>
    </div>
  );
}
```

---

### **2. استخدام useUser (جلب مستخدم واحد)**

```typescript
import { useUser } from '../hooks';

function UserProfile({ userId }: { userId: string }) {
  const { user, loading, error } = useUser(userId);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!user) return <div>المستخدم غير موجود</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>البريد: {user.email}</p>
      <p>الدور: {user.role}</p>
      <p>الحالة: {user.status}</p>
    </div>
  );
}
```

---

### **3. استخدام useUserMutations (Create, Update, Delete)**

```typescript
import { useUserMutations } from '../hooks';
import { CreateUserDto, UserRole } from '../types/user.types';

function CreateUserForm() {
  const { createUser, loading, error } = useUserMutations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newUser: CreateUserDto = {
      email: 'user@example.com',
      password: 'password123',
      name: 'New User',
      role: UserRole.RESEARCHER,
    };

    try {
      const createdUser = await createUser(newUser);
      alert(`تم إنشاء المستخدم: ${createdUser.name}`);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'جاري الإنشاء...' : 'إنشاء'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

### **4. استخدام useUserStats (الإحصائيات)**

```typescript
import { useUserStats } from '../hooks';

function UserStatistics() {
  const { stats, loading, error } = useUserStats();

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;
  if (!stats) return null;

  return (
    <div>
      <h2>إحصائيات المستخدمين</h2>
      <ul>
        <li>الإجمالي: {stats.total}</li>
        <li>باحثون: {stats.researchers}</li>
        <li>محررون: {stats.editors}</li>
        <li>مراجعون: {stats.reviewers}</li>
        <li>مدراء: {stats.admins}</li>
      </ul>
    </div>
  );
}
```

---

## 🧪 **اختبار Integration:**

### **الخطوة 1: تشغيل Backend**
```bash
cd apps/backend
npm run serve
# Backend يعمل على http://localhost:3000
```

### **الخطوة 2: تشغيل Frontend**
```bash
cd apps/frontend
npm run dev
# Frontend يعمل على http://localhost:5173 (أو 4200)
```

### **الخطوة 3: اختبار الـ Endpoints**

يمكنك استخدام `UsersExample.tsx` للاختبار:

1. افتح المتصفح على `http://localhost:5173`
2. اذهب للصفحة التي تستخدم `UsersExample`
3. جرّب:
   - عرض قائمة المستخدمين
   - إنشاء مستخدم جديد
   - حذف مستخدم
   - عرض الإحصائيات

---

## 🔧 **Configuration:**

### **Backend URL**
موجود في `.env`:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

### **Authentication**
الـ `api.ts` يضيف الـ token تلقائياً من `localStorage`:
```typescript
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

---

## 🐛 **Error Handling:**

### **رسائل الأخطاء بالعربي:**
```typescript
404 → "المستخدم غير موجود"
409 → "البريد الإلكتروني مستخدم بالفعل"
400 → "البيانات المدخلة غير صحيحة"
401 → "يجب تسجيل الدخول أولاً"
403 → "ليس لديك صلاحية لهذا الإجراء"
500 → "حدث خطأ في الخادم"
```

### **Backend Validation Errors:**
Backend يرسل validation errors بصيغة:
```json
{
  "statusCode": 400,
  "message": ["البريد الإلكتروني غير صحيح", "كلمة المرور قصيرة جداً"],
  "error": "Bad Request"
}
```

الـ Service يعرضها بشكل واضح للمستخدم.

---

## 📚 **المراجع:**

- [NestJS Tutorial](../../NESTJS_TUTORIAL.md)
- [Frontend Integration Plan](../../FRONTEND_INTEGRATION_PLAN.md)
- [Backend Users Controller](../../apps/backend/src/modules/users/users.controller.ts)

---

## ✅ **Checklist:**

- [x] Types & Enums
- [x] Users Service
- [x] useUsers Hook
- [x] useUser Hook
- [x] useUserMutations Hook
- [x] useUserStats Hook
- [x] Example Component
- [x] Documentation
- [ ] **Testing with Backend** ← الخطوة التالية!

---

## 🎯 **الخطوات التالية:**

1. **اختبار Integration:**
   - شغّل Backend و Frontend
   - جرّب كل الـ endpoints
   - تأكد من error handling

2. **إضافة UI Components:**
   - UsersList Component
   - UserForm Component
   - UserCard Component
   - UserProfile Component

3. **إضافة Features:**
   - Search & Filter
   - Pagination
   - Sorting
   - Bulk Actions

4. **تحسينات:**
   - Toast Notifications
   - Loading Skeletons
   - Optimistic Updates
   - Caching (React Query)

---

**🎉 Frontend جاهز للربط مع Backend!**
