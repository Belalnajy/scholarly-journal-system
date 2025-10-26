# نظام استعادة كلمة المرور - Password Reset System

## نظرة عامة
تم إنشاء نظام كامل لاستعادة كلمة المرور باستخدام Gmail SMTP مع رموز تحقق مكونة من 6 أرقام.

---

## Backend Implementation

### 1. Email Module
تم إنشاء `EmailModule` لإرسال رسائل البريد الإلكتروني باستخدام Gmail SMTP.

**Files Created:**
- `/modules/email/email.service.ts`
- `/modules/email/email.module.ts`

**Features:**
- ✅ إرسال رمز التحقق (6 أرقام)
- ✅ تصميم HTML احترافي للرسائل
- ✅ رسالة تأكيد بعد تغيير كلمة المرور
- ✅ دعم RTL للغة العربية

---

### 2. Database Entity
تم إنشاء جدول `password_reset_tokens` لتخزين رموز التحقق.

**Entity:** `PasswordResetToken`
```typescript
{
  id: uuid (PK)
  email: string
  token: string (6 digits)
  user_id: uuid (FK)
  expires_at: timestamp (15 minutes)
  is_used: boolean
  created_at: timestamp
}
```

**Indexes:**
- `idx_password_reset_tokens_token`
- `idx_password_reset_tokens_email`

---

### 3. DTOs Created

#### ForgotPasswordDto
```typescript
{
  email: string (required, valid email)
}
```

#### VerifyResetCodeDto
```typescript
{
  email: string (required, valid email)
  code: string (required, 6 digits)
}
```

#### ResetPasswordDto
```typescript
{
  email: string (required, valid email)
  code: string (required, 6 digits)
  newPassword: string (required, min 8 chars)
}
```

---

### 4. API Endpoints

#### POST /api/auth/forgot-password
**Access:** Public  
**Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
}
```

#### POST /api/auth/verify-reset-code
**Access:** Public  
**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```
**Response:**
```json
{
  "message": "رمز التحقق صحيح",
  "valid": true
}
```

#### POST /api/auth/reset-password
**Access:** Public  
**Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123"
}
```
**Response:**
```json
{
  "message": "تم تغيير كلمة المرور بنجاح"
}
```

#### POST /api/auth/resend-reset-code
**Access:** Public  
**Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
}
```

---

### 5. AuthService Methods

#### `forgotPassword(email: string)`
- يتحقق من وجود المستخدم
- يتحقق من أن الحساب نشط
- يولد رمز 6 أرقام
- يحذف أي رموز قديمة غير مستخدمة
- يحفظ الرمز في Database (صالح لمدة 15 دقيقة)
- يرسل البريد الإلكتروني

#### `verifyResetCode(email: string, code: string)`
- يتحقق من صحة الرمز
- يتحقق من عدم انتهاء صلاحيته
- يتحقق من عدم استخدامه مسبقاً

#### `resetPassword(email: string, code: string, newPassword: string)`
- يتحقق من الرمز
- يشفر كلمة المرور الجديدة (bcrypt)
- يحدث كلمة المرور في Database
- يضع علامة على الرمز كمستخدم
- يرسل إشعار داخلي للمستخدم
- يرسل بريد تأكيد

#### `resendResetCode(email: string)`
- يعيد إرسال رمز جديد

#### `cleanupExpiredTokens()`
- يحذف الرموز منتهية الصلاحية (للـ cron job)

---

### 6. UsersService Enhancement
تم إضافة method جديد:

#### `updatePassword(userId: string, hashedPassword: string)`
- يحدث كلمة المرور
- يرسل إشعار للمستخدم

---

## Environment Variables

يجب إضافة المتغيرات التالية في `/apps/backend/.env`:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=journalresearchut@gmail.com
EMAIL_PASSWORD=vxgd udzy okjp rrjb

# Existing variables...
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=...
```

---

## Frontend Integration

### 1. Auth Service Methods

يجب إضافة الـ methods التالية في `/apps/frontend/src/services/auth.service.ts`:

```typescript
// Request password reset
async forgotPassword(email: string) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

// Verify reset code
async verifyResetCode(email: string, code: string) {
  const response = await api.post('/auth/verify-reset-code', { email, code });
  return response.data;
}

// Reset password
async resetPassword(email: string, code: string, newPassword: string) {
  const response = await api.post('/auth/reset-password', { 
    email, 
    code, 
    newPassword 
  });
  return response.data;
}

// Resend code
async resendResetCode(email: string) {
  const response = await api.post('/auth/resend-reset-code', { email });
  return response.data;
}
```

### 2. Update Pages

#### ForgotPasswordPage.tsx
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await authService.forgotPassword(email);
    navigate('/verify-code', { state: { email } });
  } catch (error) {
    // Handle error
  }
};
```

#### VerifyCodePage.tsx
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const verificationCode = code.join('');
  try {
    await authService.verifyResetCode(email, verificationCode);
    navigate('/reset-password', { state: { email, code: verificationCode } });
  } catch (error) {
    // Handle error
  }
};

const handleResend = async () => {
  try {
    await authService.resendResetCode(email);
    setCode(['', '', '', '', '', '']);
    // Show success message
  } catch (error) {
    // Handle error
  }
};
```

#### ResetPasswordPage.tsx
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (newPassword !== confirmPassword) {
    alert('كلمات المرور غير متطابقة');
    return;
  }
  
  try {
    await authService.resetPassword(email, code, newPassword);
    alert('تم تغيير كلمة المرور بنجاح!');
    navigate('/login');
  } catch (error) {
    // Handle error
  }
};
```

---

## Workflow

### User Flow:
1. **ForgotPasswordPage**: المستخدم يدخل البريد الإلكتروني
2. **Backend**: يولد رمز 6 أرقام ويرسله للبريد
3. **VerifyCodePage**: المستخدم يدخل الرمز
4. **Backend**: يتحقق من صحة الرمز
5. **ResetPasswordPage**: المستخدم يدخل كلمة المرور الجديدة
6. **Backend**: يحدث كلمة المرور ويرسل تأكيد
7. **LoginPage**: المستخدم يسجل الدخول بكلمة المرور الجديدة

### Email Flow:
1. User requests reset → Email sent with 6-digit code
2. Code valid for 15 minutes
3. User enters code → Verified
4. User sets new password → Password updated
5. Confirmation email sent

---

## Security Features

✅ **Token Expiration**: الرموز تنتهي بعد 15 دقيقة  
✅ **One-Time Use**: كل رمز يستخدم مرة واحدة فقط  
✅ **Password Hashing**: bcrypt مع salt  
✅ **Email Verification**: التحقق من البريد الإلكتروني  
✅ **Active Account Check**: فقط الحسابات النشطة  
✅ **Rate Limiting**: يمكن إضافة rate limiting لاحقاً  

---

## Email Templates

### Reset Code Email
- تصميم HTML احترافي
- RTL support
- رمز التحقق بخط كبير
- تحذيرات أمنية
- صالح لمدة 15 دقيقة

### Success Email
- تأكيد تغيير كلمة المرور
- تحذير إذا لم يقم المستخدم بالتغيير
- تعليمات للتواصل مع الدعم

---

## Testing

### Test Flow:
1. Start backend: `nx serve backend`
2. Start frontend: `nx serve frontend`
3. Go to `/forgot-password`
4. Enter email: `admin@demo.com`
5. Check email inbox for code
6. Enter code in `/verify-code`
7. Set new password in `/reset-password`
8. Login with new password

### Test Accounts:
- admin@demo.com
- editor@demo.com
- reviewer@demo.com
- researcher@demo.com

---

## Files Modified/Created

### Backend:
- ✅ `/modules/email/email.service.ts` (NEW)
- ✅ `/modules/email/email.module.ts` (NEW)
- ✅ `/database/entities/password-reset-token.entity.ts` (NEW)
- ✅ `/database/entities/index.ts` (UPDATED)
- ✅ `/modules/auth/dto/forgot-password.dto.ts` (NEW)
- ✅ `/modules/auth/dto/verify-reset-code.dto.ts` (NEW)
- ✅ `/modules/auth/dto/reset-password.dto.ts` (NEW)
- ✅ `/modules/auth/auth.service.ts` (UPDATED)
- ✅ `/modules/auth/auth.controller.ts` (UPDATED)
- ✅ `/modules/auth/auth.module.ts` (UPDATED)
- ✅ `/modules/users/users.service.ts` (UPDATED - added updatePassword)

### Frontend:
- ⏳ `/services/auth.service.ts` (TO UPDATE)
- ⏳ `/pages/ForgotPasswordPage.tsx` (TO UPDATE)
- ⏳ `/pages/VerifyCodePage.tsx` (TO UPDATE)
- ⏳ `/pages/ResetPasswordPage.tsx` (TO UPDATE)

---

## Dependencies Added

```json
{
  "nodemailer": "^6.9.x",
  "@types/nodemailer": "^6.4.x"
}
```

---

## Next Steps

1. ✅ Backend Complete
2. ⏳ Add environment variables to `.env`
3. ⏳ Update Frontend auth service
4. ⏳ Update Frontend pages
5. ⏳ Test complete flow
6. ⏳ Add error handling & loading states

---

## Status

✅ **Backend**: 100% Complete  
⏳ **Environment Variables**: Pending  
⏳ **Frontend Integration**: Pending  
⏳ **Testing**: Pending  

---

## Notes

- Gmail App Password يجب أن يكون صحيح ونشط
- يجب تفعيل "Less secure app access" أو استخدام App Password
- الرموز تُحذف تلقائياً بعد الاستخدام
- يمكن إضافة Cron Job لحذف الرموز منتهية الصلاحية
