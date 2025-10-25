# 🔐 Auth Integration - Login & Registration

## ✅ **ما تم إنجازه:**

تم ربط صفحات Login و Registration بالـ Backend بشكل كامل:
- ✅ Auth Service للتواصل مع Users API
- ✅ تحديث AuthContext للربط مع Backend
- ✅ تحديث LoginPage
- ✅ تحديث RegistrationPage
- ✅ Error Handling بالعربي
- ✅ Loading States

---

## 📁 **الملفات المُحدثة:**

### **1. Auth Service** (`src/services/auth.service.ts`)
```typescript
authService.login(credentials)      // تسجيل الدخول
authService.register(data)          // إنشاء حساب جديد
authService.logout()                // تسجيل الخروج
authService.getCurrentUser()        // جلب المستخدم الحالي
authService.isAuthenticated()       // التحقق من تسجيل الدخول
```

### **2. Auth Context** (`src/contexts/AuthContext.tsx`)
```typescript
const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

### **3. Login Page** (`src/pages/LoginPage.tsx`)
- ✅ متصل بالـ Backend
- ✅ Error handling
- ✅ Loading states
- ✅ Auto-redirect بعد Login

### **4. Registration Page** (`src/pages/RegistrationPage.tsx`)
- ✅ متصل بالـ Backend
- ✅ Error handling
- ✅ Loading states
- ✅ Auto-redirect بعد Registration

---

## 🔄 **كيف يعمل؟**

### **Login Flow:**

```
1. User يدخل Email & Password
   ↓
2. LoginPage.handleLogin()
   ↓
3. AuthContext.login()
   ↓
4. authService.login()
   ↓
5. usersService.getAll() - جلب كل المستخدمين
   ↓
6. البحث عن User بالـ Email
   ↓
7. حفظ userId & token في localStorage
   ↓
8. تحديث AuthContext.user
   ↓
9. Redirect إلى /dashboard
```

### **Registration Flow:**

```
1. User يملأ النموذج
   ↓
2. RegistrationPage.handleRegistration()
   ↓
3. تحويل FormData إلى CreateUserDto
   ↓
4. AuthContext.register()
   ↓
5. authService.register()
   ↓
6. usersService.create() - إنشاء User جديد
   ↓
7. حفظ userId & token في localStorage
   ↓
8. تحديث AuthContext.user
   ↓
9. Redirect إلى /dashboard
```

---

## 🔑 **Session Management:**

### **Storage:**
```typescript
localStorage.setItem('userId', user.id);
localStorage.setItem('token', mockToken);
```

### **Auto-Login:**
عند فتح التطبيق، AuthContext يتحقق من localStorage:
```typescript
useEffect(() => {
  if (authService.isAuthenticated()) {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  }
}, []);
```

### **Auto-Logout:**
في `api.ts` interceptor:
```typescript
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  window.location.href = '/login';
}
```

---

## ⚠️ **ملاحظة مهمة:**

### **Password Verification:**

حالياً، Backend لا يوجد به Auth endpoints منفصلة، لذلك:

1. **Login:** نجلب كل المستخدمين ونبحث عن Email
   - ⚠️ **لا نستطيع التحقق من Password** لأن Backend يخزنها مُشفرة (bcrypt)
   - ✅ في الإنتاج، يجب إنشاء `/auth/login` endpoint في Backend

2. **Registration:** نستخدم `/users` endpoint
   - ✅ يعمل بشكل صحيح
   - ✅ Password يُشفر تلقائياً في Backend

### **الحل المؤقت:**
```typescript
// في auth.service.ts
const user = users.find(u => u.email === credentials.email);
if (!user) {
  return { success: false, error: 'خطأ في البيانات' };
}
// نفترض أن User موجود = Login ناجح
```

### **الحل النهائي (مطلوب في Backend):**
```typescript
// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "user": { ... },
  "token": "jwt_token_here"
}
```

---

## 🧪 **كيفية الاختبار:**

### **1. تشغيل Backend:**
```bash
cd apps/backend
npm run serve
# Backend على http://localhost:3000
```

### **2. تشغيل Frontend:**
```bash
cd apps/frontend
npm run dev
# Frontend على http://localhost:5173
```

### **3. اختبار Registration:**

1. افتح `/register`
2. املأ النموذج:
   ```
   الاسم الأول: محمد
   الاسم الأخير: أحمد
   البريد: mohamed@example.com
   كلمة المرور: password123
   تأكيد كلمة المرور: password123
   الهاتف: +201234567890
   المؤسسة: جامعة القاهرة
   التخصص: علوم الحاسب
   ```
3. اضغط "إنشاء حساب"
4. يجب أن يتم:
   - ✅ إنشاء User في Database
   - ✅ Auto-login
   - ✅ Redirect إلى /dashboard

### **4. اختبار Login:**

1. افتح `/login`
2. أدخل:
   ```
   البريد: mohamed@example.com
   كلمة المرور: أي شيء (لن يتم التحقق منها حالياً)
   ```
3. اضغط "تسجيل الدخول"
4. يجب أن يتم:
   - ✅ البحث عن User
   - ✅ تسجيل الدخول
   - ✅ Redirect إلى /dashboard

---

## 🐛 **Error Handling:**

### **رسائل الأخطاء:**

| الحالة | الرسالة |
|--------|---------|
| Email غير موجود | "البريد الإلكتروني أو كلمة المرور غير صحيحة" |
| Email مستخدم (Registration) | "البريد الإلكتروني مستخدم بالفعل" |
| بيانات غير صحيحة | "البيانات المدخلة غير صحيحة" |
| خطأ في الاتصال | "حدث خطأ في الاتصال بالخادم" |
| خطأ غير متوقع | "حدث خطأ غير متوقع" |

### **Validation Errors من Backend:**
```json
{
  "statusCode": 400,
  "message": [
    "البريد الإلكتروني غير صحيح",
    "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
  ],
  "error": "Bad Request"
}
```

تُعرض كـ: "البريد الإلكتروني غير صحيح, كلمة المرور يجب أن تكون 8 أحرف على الأقل"

---

## 🔒 **Security:**

### **ما تم تطبيقه:**
- ✅ Password لا يُعرض في UI
- ✅ Password يُشفر في Backend (bcrypt)
- ✅ Token في localStorage
- ✅ Auto-logout عند 401

### **ما يحتاج تحسين:**
- ⚠️ استخدام JWT tokens حقيقية
- ⚠️ Refresh tokens
- ⚠️ HTTPS في Production
- ⚠️ CSRF protection
- ⚠️ Rate limiting

---

## 📊 **Data Mapping:**

### **Registration Form → CreateUserDto:**

```typescript
{
  email: formData.email,                    // ✅
  password: formData.password,              // ✅
  name: `${firstName} ${lastName}`,         // ✅
  phone: formData.phone,                    // ✅
  role: formData.accountType,               // ✅
  affiliation: formData.institution,        // ✅
  specialization: formData.specialization,  // ✅
  orcid_id: formData.orcid,                // ✅
}
```

### **حقول غير مستخدمة (يمكن إضافتها):**
- `country` - البلد
- `city` - المدينة
- `confirmPassword` - تأكيد كلمة المرور (Frontend validation فقط)
- `acceptTerms` - قبول الشروط (Frontend validation فقط)

---

## 🎯 **الخطوات التالية:**

### **مطلوب في Backend:**

1. **إنشاء Auth Module:**
   ```bash
   nx generate @nx/nest:module auth
   nx generate @nx/nest:service auth
   nx generate @nx/nest:controller auth
   ```

2. **Auth Endpoints:**
   ```typescript
   POST /api/auth/register  // تسجيل حساب جديد
   POST /api/auth/login     // تسجيل الدخول
   POST /api/auth/logout    // تسجيل الخروج
   GET  /api/auth/me        // جلب المستخدم الحالي
   POST /api/auth/refresh   // تجديد Token
   ```

3. **JWT Implementation:**
   ```bash
   npm install @nestjs/jwt @nestjs/passport passport passport-jwt
   npm install -D @types/passport-jwt
   ```

4. **Guards & Decorators:**
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Get('profile')
   getProfile(@CurrentUser() user: User) {
     return user;
   }
   ```

### **تحسينات في Frontend:**

1. **Protected Routes:**
   ```typescript
   <Route element={<ProtectedRoute />}>
     <Route path="/dashboard" element={<Dashboard />} />
   </Route>
   ```

2. **Remember Me:**
   - حفظ في localStorage vs sessionStorage

3. **Password Strength Indicator:**
   - عرض قوة كلمة المرور

4. **Email Verification:**
   - إرسال email تأكيد

5. **Forgot Password:**
   - صفحة استعادة كلمة المرور

---

## 📚 **المراجع:**

- [Users Integration](./FRONTEND_INTEGRATION_PLAN.md)
- [NestJS Tutorial](./NESTJS_TUTORIAL.md)
- [Backend Users Module](./apps/backend/src/modules/users/)

---

## ✅ **Checklist:**

- [x] Auth Service
- [x] Auth Context
- [x] Login Page
- [x] Registration Page
- [x] Error Handling
- [x] Loading States
- [x] Auto-redirect
- [x] Session Management
- [ ] **Backend Auth Module** ← مطلوب!
- [ ] JWT Tokens
- [ ] Protected Routes
- [ ] Password Verification

---

**🎉 Login & Registration جاهزين للاستخدام مع Backend!**

**⚠️ ملاحظة:** حالياً لا يتم التحقق من Password عند Login. يجب إنشاء Auth module في Backend لتطبيق ذلك بشكل صحيح.
