# 🌐 دليل استخدام صفحة إعدادات الموقع

## ✅ ما تم إنجازه

تم إنشاء صفحة كاملة لإدارة إعدادات الموقع في لوحة تحكم الـ Admin.

---

## 📁 الملفات المُنشأة

### 1. **Service Layer**
```
apps/frontend/src/services/site-settings.service.ts
```
- ✅ `getSettings()` - الحصول على الإعدادات (Admin)
- ✅ `getPublicSettings()` - الحصول على الإعدادات العامة
- ✅ `updateSettings()` - تحديث الإعدادات
- ✅ `toggleMaintenanceMode()` - تفعيل/تعطيل وضع الصيانة

### 2. **Page Component**
```
apps/frontend/src/pages/dashboard/SiteSettingsPage.tsx
```
صفحة شاملة لإدارة جميع إعدادات الموقع

### 3. **Navigation & Routes**
- ✅ تم إضافة الصفحة في `adminNavItems` (dashboardNavigation.ts)
- ✅ تم إضافة الـ route في `DashboardPage.tsx`
- ✅ تم إضافة الـ export في `index.ts`

---

## 🎨 مميزات الصفحة

### 1. **وضع الصيانة (Maintenance Mode)**
- Toggle switch لتفعيل/تعطيل وضع الصيانة
- حقل لإدخال رسالة الصيانة
- تحديث فوري عند التبديل

### 2. **المعلومات الأساسية**
- اسم الموقع (عربي/إنجليزي)
- رابط الشعار (Logo URL)
- رابط الأيقونة (Favicon URL)

### 3. **عن المجلة**
- مقدمة عن المجلة
- الرسالة (Mission)
- الرؤية (Vision)
- الأهداف (Goals) - قائمة ديناميكية قابلة للإضافة والحذف

### 4. **معلومات الاتصال**
- البريد الإلكتروني
- رقم الهاتف
- رقم الفاكس
- العنوان

### 5. **روابط التواصل الاجتماعي**
- فيسبوك
- تويتر
- لينكد إن
- إنستغرام
- يوتيوب

---

## 🎯 كيفية الوصول للصفحة

### للـ Admin فقط:
1. تسجيل الدخول كـ Admin
2. من القائمة الجانبية، اختر **"إعدادات الموقع"**
3. أو الذهاب مباشرة إلى: `/dashboard/site-settings`

---

## 🔐 الحماية والصلاحيات

- ✅ الصفحة محمية بـ `ProtectedRoute`
- ✅ متاحة فقط لـ `UserRole.ADMIN`
- ✅ أي محاولة للوصول من دور آخر سيتم رفضها

---

## 💾 حفظ الإعدادات

### عملية الحفظ:
1. المستخدم يعدل الحقول
2. الضغط على زر **"حفظ الإعدادات"**
3. يتم إرسال البيانات للـ Backend
4. عرض رسالة نجاح/فشل
5. تحديث الإعدادات تلقائياً

### رسائل التنبيه:
- ✅ رسالة نجاح خضراء عند الحفظ بنجاح
- ❌ رسالة خطأ حمراء عند الفشل
- ⏱️ الرسائل تختفي تلقائياً بعد 3 ثوان

---

## 🎨 التصميم والـ UI

### الألوان:
- **Primary**: Blue (#0D3B66)
- **Success**: Green
- **Error**: Red
- **Background**: White with gray borders

### الأيقونات:
- استخدام `lucide-react` icons
- أيقونات واضحة لكل قسم

### الـ Layout:
- Cards منفصلة لكل قسم
- Responsive design (Grid system)
- RTL support كامل

---

## 📋 الأقسام الرئيسية

### 1. **Maintenance Mode Card**
```tsx
- Toggle switch
- Maintenance message textarea (يظهر عند التفعيل)
```

### 2. **Basic Information Card**
```tsx
- Site name (AR/EN)
- Logo URL
- Favicon URL
```

### 3. **About Section Card**
```tsx
- About intro
- Mission
- Vision
- Goals (dynamic list)
```

### 4. **Contact Information Card**
```tsx
- Email
- Phone
- Fax
- Address
```

### 5. **Social Media Links Card**
```tsx
- Facebook
- Twitter
- LinkedIn
- Instagram
- YouTube
```

---

## 🔄 إدارة الأهداف (Goals)

### إضافة هدف جديد:
1. كتابة الهدف في حقل الإدخال
2. الضغط على زر **"إضافة"** أو Enter
3. يُضاف الهدف للقائمة

### حذف هدف:
1. الضغط على زر **"حذف"** بجانب الهدف
2. يُحذف الهدف من القائمة

---

## 🚀 الاستخدام

### مثال على تحديث الإعدادات:

```typescript
// في SiteSettingsPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    setSaving(true);
    await siteSettingsService.updateSettings(formData);
    setMessage({ type: 'success', text: 'تم حفظ الإعدادات بنجاح' });
    await fetchSettings(); // Refresh
  } catch (error) {
    setMessage({ type: 'error', text: 'فشل في حفظ الإعدادات' });
  } finally {
    setSaving(false);
  }
};
```

### مثال على تفعيل وضع الصيانة:

```typescript
const handleToggleMaintenanceMode = async () => {
  try {
    const newMode = !formData.is_maintenance_mode;
    await siteSettingsService.toggleMaintenanceMode(newMode);
    setFormData({ ...formData, is_maintenance_mode: newMode });
    setMessage({ 
      type: 'success', 
      text: newMode ? 'تم تفعيل وضع الصيانة' : 'تم تعطيل وضع الصيانة' 
    });
  } catch (error) {
    setMessage({ type: 'error', text: 'فشل في تغيير وضع الصيانة' });
  }
};
```

---

## 🔗 الربط مع الـ Backend

### API Endpoints المستخدمة:

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/site-settings` | الحصول على الإعدادات |
| GET | `/site-settings/public` | الإعدادات العامة |
| PATCH | `/site-settings` | تحديث الإعدادات |
| POST | `/site-settings/maintenance-mode` | تبديل وضع الصيانة |

### مثال على الـ Request:

```typescript
// Update settings
PATCH /site-settings
{
  "site_name": "مجلة الدراسات والبحوث",
  "site_name_en": "Journal of Studies and Research",
  "mission": "نشر الأبحاث العلمية المحكمة",
  "contact_info": {
    "email": "info@journal.com",
    "phone": "+966123456789"
  },
  "social_links": {
    "facebook": "https://facebook.com/journal",
    "twitter": "https://twitter.com/journal"
  }
}
```

---

## ✨ الخطوات التالية (اختياري)

1. **إضافة Upload للصور:**
   - رفع الشعار والأيقونة مباشرة
   - بدلاً من إدخال الروابط يدوياً

2. **معاينة مباشرة:**
   - عرض معاينة للشعار عند إدخال الرابط
   - معاينة الأيقونة

3. **Validation محسّن:**
   - التحقق من صحة الروابط
   - التحقق من صيغة البريد الإلكتروني
   - التحقق من صيغة رقم الهاتف

4. **History/Audit:**
   - تسجيل تاريخ التعديلات
   - من قام بالتعديل ومتى

5. **Backup/Restore:**
   - حفظ نسخة احتياطية من الإعدادات
   - استعادة إعدادات سابقة

---

## 🎉 النتيجة

تم إنشاء صفحة احترافية وشاملة لإدارة إعدادات الموقع:

- ✅ **UI جميل وسهل الاستخدام**
- ✅ **RTL support كامل**
- ✅ **Responsive design**
- ✅ **Loading states**
- ✅ **Error handling**
- ✅ **Success messages**
- ✅ **Protected routes**
- ✅ **Admin only access**
- ✅ **Full CRUD operations**
- ✅ **Dynamic goals management**
- ✅ **Maintenance mode toggle**

---

## 📸 لقطات الشاشة (Screenshots)

### الصفحة الرئيسية:
- Header مع العنوان والوصف
- Maintenance mode toggle
- جميع الأقسام منظمة في cards

### وضع الصيانة:
- Toggle switch واضح
- حقل رسالة الصيانة يظهر عند التفعيل

### إدارة الأهداف:
- حقل إدخال + زر إضافة
- قائمة بالأهداف مع زر حذف لكل هدف

---

تم إنجاز المهمة بنجاح! 🎊
