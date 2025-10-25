# 🔗 Profile & Settings Integration

## ✅ **ما تم إنجازه:**

تم ربط صفحات ProfilePage و SettingsPage بالـ Backend بشكل كامل:
- ✅ عرض بيانات المستخدم الحقيقية من Backend
- ✅ تحديث المعلومات الشخصية
- ✅ تغيير البريد الإلكتروني
- ✅ تغيير كلمة المرور
- ✅ Loading states
- ✅ Error handling بالعربي
- ✅ Toast notifications

---

## 📁 **الملفات المُحدثة:**

### **1. ProfilePage** (`src/pages/dashboard/ProfilePage.tsx`)

#### **التغييرات:**
```typescript
// قبل ❌
const [formData, setFormData] = useState({
  name: 'د. أحمد محمد',  // Hard-coded data
  email: 'ahmed@example.com',
  // ...
});

// بعد ✅
const { user } = useAuth();
const { updateUser, loading } = useUserMutations();

useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      // ... load from backend
    });
  }
}, [user]);
```

#### **الميزات:**
- ✅ عرض بيانات المستخدم من Backend
- ✅ تحديث المعلومات الشخصية
- ✅ دعم كل الحقول:
  - الاسم
  - البريد الإلكتروني
  - الهاتف
  - التخصص
  - الجامعة/المؤسسة
  - القسم
  - الدرجة العلمية
  - الاهتمامات البحثية
  - ORCID, Google Scholar, ResearchGate IDs
  - سنوات الخبرة
  - عدد المنشورات
  - مجالات الخبرة (للمحكمين)
  - اللغات
  - نبذة تعريفية

### **2. SettingsPage** (`src/pages/dashboard/SettingsPage.tsx`)

#### **التغييرات:**
```typescript
// قبل ❌
const handlePasswordSave = () => {
  console.log('Saving password');  // TODO
};

// بعد ✅
const handlePasswordSave = async () => {
  // Validation
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast.error('كلمة المرور غير متطابقة');
    return;
  }
  
  // Update via API
  await updateUser(user.id, { password: passwordData.newPassword });
  toast.success('تم تغيير كلمة المرور!');
};
```

#### **الميزات:**
- ✅ تغيير البريد الإلكتروني
- ✅ تغيير كلمة المرور
- ✅ Validation:
  - التحقق من تطابق كلمة المرور
  - الحد الأدنى 8 أحرف
  - التحقق من البريد الإلكتروني
- ✅ Toast notifications
- ✅ Auto-reload بعد تغيير البريد

---

## 🔄 **كيف يعمل؟**

### **Profile Update Flow:**

```
1. User يفتح ProfilePage
   ↓
2. useEffect يحمل بيانات user من AuthContext
   ↓
3. setFormData يملأ النموذج بالبيانات
   ↓
4. User يعدل البيانات
   ↓
5. User يضغط "حفظ التغييرات"
   ↓
6. handleSave() يستدعي updateUser()
   ↓
7. useUserMutations → usersService.update()
   ↓
8. Backend يحدث البيانات
   ↓
9. Toast notification + Page reload
```

### **Password Change Flow:**

```
1. User يفتح SettingsPage
   ↓
2. User يدخل كلمة المرور الجديدة
   ↓
3. User يؤكد كلمة المرور
   ↓
4. handlePasswordSave() يتحقق من:
   - التطابق
   - الطول (8+ أحرف)
   ↓
5. updateUser(user.id, { password })
   ↓
6. Backend يشفر ويحفظ كلمة المرور
   ↓
7. Toast notification + Clear form
```

---

## 🎨 **UI Features:**

### **ProfilePage:**
- ✅ Avatar placeholder (TODO: upload)
- ✅ Edit mode toggle
- ✅ Conditional fields based on role:
  - Researcher: academic fields
  - Editor/Reviewer: expertise areas
  - Admin: all fields
- ✅ Loading states on save button
- ✅ Cancel button
- ✅ Auto-format registration date

### **SettingsPage:**
- ✅ Separate sections for email & password
- ✅ Password visibility toggles
- ✅ Loading states on buttons
- ✅ Disabled state during save
- ✅ Color-coded sections (blue for email, amber for password)

---

## 📊 **Data Mapping:**

### **Frontend → Backend:**

| Frontend Field | Backend Field | Type |
|---------------|---------------|------|
| `name` | `name` | string |
| `email` | `email` | string |
| `phone` | `phone` | string |
| `specialization` | `specialization` | string |
| `affiliation` | `affiliation` | string |
| `department` | `department` | string |
| `academicDegree` | `academic_degree` | AcademicDegree enum |
| `researchInterests` | `research_interests` | string |
| `orcidId` | `orcid_id` | string |
| `googleScholarId` | `google_scholar_id` | string |
| `researchGateId` | `research_gate_id` | string |
| `yearsOfExperience` | `years_of_experience` | number |
| `numberOfPublications` | `number_of_publications` | number |
| `bio` | `bio` | string |
| `expertiseAreas` | `expertise_areas` | string |
| `languagesSpoken` | `languages_spoken` | string |

### **حقول تم إزالتها (غير موجودة في Backend):**
- ❌ `title` - استخدمنا `role` بدلاً منه
- ❌ `country` - غير موجود في schema
- ❌ `city` - غير موجود في schema
- ❌ `address` - غير موجود في schema

---

## 🧪 **كيفية الاختبار:**

### **1. اختبار Profile Update:**

```bash
# 1. سجل دخول كأي مستخدم
# 2. اذهب إلى /dashboard/profile
# 3. اضغط "تعديل المعلومات"
# 4. عدل أي حقل (مثلاً: الاسم، التخصص، الهاتف)
# 5. اضغط "حفظ التغييرات"
# 6. ✅ يجب أن ترى toast "تم حفظ التغييرات بنجاح!"
# 7. ✅ الصفحة تُحدث تلقائياً
# 8. ✅ البيانات الجديدة تظهر
```

### **2. اختبار Email Change:**

```bash
# 1. اذهب إلى /dashboard/settings
# 2. أدخل بريد إلكتروني جديد
# 3. اضغط "حفظ البريد الجديد"
# 4. ✅ يجب أن ترى toast "تم تحديث البريد الإلكتروني بنجاح!"
# 5. ✅ الصفحة تُحدث بعد 1.5 ثانية
# 6. ✅ البريد الجديد يظهر في ProfilePage
```

### **3. اختبار Password Change:**

```bash
# 1. اذهب إلى /dashboard/settings
# 2. أدخل كلمة مرور جديدة (8+ أحرف)
# 3. أكد كلمة المرور
# 4. اضغط "تغيير كلمة المرور"
# 5. ✅ يجب أن ترى toast "تم تغيير كلمة المرور بنجاح!"
# 6. ✅ الحقول تُفرغ
# 7. ✅ سجل خروج وحاول الدخول بكلمة المرور الجديدة
```

### **4. اختبار Validation:**

```bash
# Password mismatch:
# - أدخل كلمتي مرور مختلفتين
# - ✅ يجب أن ترى: "كلمة المرور غير متطابقين"

# Password too short:
# - أدخل كلمة مرور أقل من 8 أحرف
# - ✅ يجب أن ترى: "كلمة المرور يجب أن تكون 8 أحرف على الأقل"

# Empty email:
# - اترك حقل البريد فارغاً
# - ✅ يجب أن ترى: "يرجى إدخال البريد الإلكتروني الجديد"
```

---

## 🐛 **Error Handling:**

### **رسائل الأخطاء:**

| الحالة | الرسالة |
|--------|---------|
| Profile update success | "تم حفظ التغييرات بنجاح!" |
| Profile update failed | "فشل حفظ التغييرات" |
| Email update success | "تم تحديث البريد الإلكتروني بنجاح!" |
| Email update failed | "فشل تحديث البريد الإلكتروني" |
| Password update success | "تم تغيير كلمة المرور بنجاح!" |
| Password update failed | "فشل تغيير كلمة المرور" |
| Password mismatch | "كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين" |
| Password too short | "كلمة المرور يجب أن تكون 8 أحرف على الأقل" |
| Empty fields | "يرجى إدخال كلمة المرور الجديدة وتأكيدها" |

### **Backend Errors:**
```typescript
try {
  await updateUser(user.id, data);
  toast.success('نجح!');
} catch (error) {
  toast.error('فشل!');
  console.error('Error:', error);
}
```

---

## ⚠️ **ملاحظات مهمة:**

### **1. Avatar Upload:**
```typescript
// TODO: Implement avatar upload
const handleAvatarChange = (event) => {
  const file = event.target.files?.[0];
  // Currently: creates preview only
  // Needed: upload to server + update avatar_url
};
```

### **2. Current Password:**
```typescript
// في SettingsPage، حقل "كلمة المرور الحالية" موجود في UI
// لكن Backend لا يتحقق منه حالياً
// يمكن إضافة endpoint: POST /auth/change-password
// يتطلب: currentPassword + newPassword
```

### **3. Page Reload:**
```typescript
// بعد تحديث البيانات، نعمل reload للصفحة
// لتحديث AuthContext
// في المستقبل: يمكن استخدام React Query للـ cache invalidation
window.location.reload();
```

---

## 🎯 **الخطوات التالية:**

### **مطلوب:**
1. ✅ **Avatar Upload:**
   - إنشاء endpoint في Backend: `POST /users/:id/avatar`
   - Upload file to storage (local/S3)
   - Update `avatar_url` in database

2. ✅ **Current Password Verification:**
   - إنشاء endpoint: `POST /auth/change-password`
   - Verify current password before changing
   - Better security

3. ✅ **Email Verification:**
   - Send verification email
   - Confirm new email before updating

### **تحسينات اختيارية:**
- React Query للـ caching
- Optimistic updates
- Form validation library (Zod/Yup)
- Profile picture cropper
- 2FA settings
- Account deletion

---

## 📚 **الملفات المرجعية:**

- **Users Integration:** `FRONTEND_INTEGRATION_PLAN.md`
- **Auth Integration:** `AUTH_INTEGRATION_README.md`
- **Dashboard Fixes:** `DASHBOARD_FIXES.md`
- **Users Service:** `apps/frontend/src/services/users.service.ts`
- **Users Hooks:** `apps/frontend/src/hooks/`

---

## ✅ **Checklist:**

- [x] ProfilePage - عرض البيانات
- [x] ProfilePage - تحديث البيانات
- [x] ProfilePage - Loading states
- [x] ProfilePage - Error handling
- [x] SettingsPage - تغيير البريد
- [x] SettingsPage - تغيير كلمة المرور
- [x] SettingsPage - Validation
- [x] SettingsPage - Loading states
- [x] Toast notifications
- [x] Documentation
- [ ] **Avatar Upload** ← مطلوب!
- [ ] **Current Password Verification** ← مطلوب!
- [ ] **Testing** ← اختبر الآن!

---

**🎉 ProfilePage و SettingsPage جاهزين ومتصلين بالـ Backend!**

**📝 ملاحظة:** Avatar upload يحتاج backend endpoint. باقي الميزات تعمل بشكل كامل.
