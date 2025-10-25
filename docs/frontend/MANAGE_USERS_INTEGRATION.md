# دليل ربط صفحة إدارة المستخدمين بالـ Backend

## 📋 نظرة عامة

هذا الدليل يشرح خطوة بخطوة كيفية ربط صفحة إدارة المستخدمين (`ManageUsersPage`) في Frontend مع Users Module في Backend.

---

## 🏗️ البنية الحالية

### Backend Structure

```
apps/backend/src/modules/users/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts
├── users.controller.ts
└── users.service.ts
```

### Frontend Structure

```
apps/frontend/src/
├── pages/dashboard/ManageUsersPage.tsx
└── services/
    ├── api.ts
    └── auth.service.ts
```

---

## 🔌 API Endpoints المتاحة

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/users` | جلب جميع المستخدمين |
| GET | `/api/users/stats` | جلب إحصائيات المستخدمين |
| GET | `/api/users/:id` | جلب مستخدم واحد |
| POST | `/api/users` | إنشاء مستخدم جديد |
| PATCH | `/api/users/:id` | تحديث مستخدم |
| DELETE | `/api/users/:id` | حذف مستخدم |

---

## 📝 خطوات التنفيذ

### الخطوة 1: إنشاء Types
### الخطوة 2: إنشاء Users Service
### الخطوة 3: تحديث ManageUsersPage
### الخطوة 4: Testing

---

## 🎯 Best Practices

- ✅ Separation of Concerns
- ✅ Error Handling
- ✅ Loading States
- ✅ Type Safety
- ✅ User Experience

---

## 🧪 Testing Checklist

- [ ] Backend endpoints working
- [ ] Frontend displays data
- [ ] Search functionality
- [ ] Error handling
- [ ] Loading states

