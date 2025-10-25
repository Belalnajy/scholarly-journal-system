# ✅ الصفحات المشتركة - Common Pages

تم إنشاء 3 صفحات مشتركة لجميع الأدوار في الـ Dashboard.

## 📄 الصفحات المنشأة

### 1. 🔔 صفحة الإشعارات (NotificationsPage)

**المسار:** `/dashboard/notifications`

**المميزات:**
- ✅ عرض جميع الإشعارات مع أنواع مختلفة (info, success, warning, error)
- ✅ تصفية الإشعارات (الكل، غير مقروءة، مقروءة)
- ✅ عداد الإشعارات غير المقروءة
- ✅ وضع علامة كمقروء لإشعار واحد
- ✅ وضع علامة على الكل كمقروء
- ✅ حذف إشعار واحد
- ✅ حذف جميع الإشعارات
- ✅ إحصائيات (إجمالي - غير مقروءة)
- ✅ حالة فارغة عند عدم وجود إشعارات

**المكونات المستخدمة:**
- `NotificationCard` - لعرض كل إشعار
- `demoNotifications` - بيانات تجريبية

---

### 2. 👤 صفحة الملف الشخصي (ProfilePage)

**المسار:** `/dashboard/profile`

**المميزات:**
- ✅ عرض معلومات المستخدم الشخصية
- ✅ صورة المستخدم (Avatar)
- ✅ الدور والإحصائيات
- ✅ تاريخ الانضمام
- ✅ وضع التعديل (Edit Mode)
- ✅ المعلومات الشخصية:
  - الاسم الكامل
  - البريد الإلكتروني
  - رقم الهاتف
  - الموقع
- ✅ المعلومات المهنية:
  - المؤسسة
  - القسم
  - نبذة تعريفية
- ✅ حفظ/إلغاء التعديلات

**التصميم:**
- Grid responsive (3 أعمدة على الشاشات الكبيرة)
- كارد جانبي للصورة والإحصائيات
- كاردات منفصلة للمعلومات

---

### 3. ⚙️ صفحة الإعدادات (SettingsPage)

**المسار:** `/dashboard/settings`

**المميزات:**

#### إعدادات الإشعارات
- ✅ إشعارات البريد الإلكتروني
- ✅ الإشعارات الفورية
- ✅ تحديثات الأبحاث
- ✅ تحديثات النظام
- ✅ ملخص أسبوعي

#### الخصوصية والأمان
- ✅ ظهور الملف الشخصي (عام، الأعضاء فقط، خاص)
- ✅ إظهار البريد الإلكتروني
- ✅ إظهار رقم الهاتف

#### اللغة والعرض
- ✅ اختيار اللغة (عربي/إنجليزي)
- ✅ اختيار المظهر (فاتح/داكن)

#### الأمان
- ✅ تغيير كلمة المرور
- ✅ المصادقة الثنائية
- ✅ الأجهزة المتصلة

**المكونات:**
- Toggle switches للإعدادات
- Radio buttons للخيارات
- Select dropdown للغة
- أزرار للمظهر

---

## 📁 الملفات

```
apps/frontend/src/pages/dashboard/
├── NotificationsPage.tsx    ✅ جديد
├── ProfilePage.tsx          ✅ جديد
├── SettingsPage.tsx         ✅ جديد
├── DashboardPage.tsx        ✅ محدث
└── index.ts                 ✅ محدث
```

## 🎯 الاستخدام

الصفحات متاحة لجميع الأدوار:
- باحث ✅
- محرر ✅
- محكم ✅
- مدير ✅

### التنقل

من الـ Sidebar، كل دور يمكنه الوصول إلى:
1. **الملف الشخصي** - `/dashboard/profile`
2. **الإشعارات** - `/dashboard/notifications`
3. **الإعدادات** - `/dashboard/settings`

## 🎨 التصميم

### الألوان
- **Primary**: `#0D3B66` - للأزرار والعناصر الرئيسية
- **Success**: أخضر - للإشعارات الناجحة
- **Warning**: أصفر - للتحذيرات
- **Error**: أحمر - للأخطاء
- **Info**: أزرق - للمعلومات

### المكونات المشتركة
- Cards بخلفية بيضاء
- Shadows للعمق
- Rounded corners
- Hover effects
- Transitions سلسة

## ✨ المميزات التقنية

✅ **TypeScript** - type-safe  
✅ **React Hooks** - useState للحالة  
✅ **Lucide Icons** - أيقونات جميلة  
✅ **Tailwind CSS** - تصميم responsive  
✅ **RTL Support** - دعم العربية  
✅ **Demo Data** - بيانات تجريبية  
✅ **Interactive** - تفاعلية بالكامل  

## 🔄 التكامل مع الباك اند

عند الربط مع الباك اند، ستحتاج إلى:

### NotificationsPage
```typescript
// Fetch notifications
const { data } = await api.get('/notifications');

// Mark as read
await api.patch(`/notifications/${id}/read`);

// Delete notification
await api.delete(`/notifications/${id}`);
```

### ProfilePage
```typescript
// Get user profile
const { data } = await api.get('/profile');

// Update profile
await api.put('/profile', formData);
```

### SettingsPage
```typescript
// Get settings
const { data } = await api.get('/settings');

// Update settings
await api.put('/settings', settings);
```

## 📝 ملاحظات

- الصفحات تستخدم `useAuth()` للحصول على بيانات المستخدم
- البيانات الحالية demo data - جاهزة للاستبدال
- جميع الإعدادات تُحفظ في state محلي حالياً
- يمكن إضافة localStorage للحفظ المؤقت

---

**الصفحات المشتركة جاهزة للاستخدام! 🎉**

الآن يمكنك البدء في بناء الصفحات الخاصة بكل دور:
- صفحات الباحث
- صفحات المحرر
- صفحات المحكم
- صفحات المدير
