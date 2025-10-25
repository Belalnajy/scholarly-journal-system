# Dashboard Components

مكونات لوحة التحكم للمجلة العلمية.

## المكونات

### DashboardSidebar
شريط جانبي يعرض قائمة التنقل بناءً على دور المستخدم.

**Props:**
- `navItems`: قائمة عناصر التنقل
- `userInfo`: معلومات المستخدم (الاسم، الدور، الصورة)
- `onLogout`: دالة تسجيل الخروج

### DashboardLayout
تخطيط رئيسي يحتوي على الـ Sidebar والمحتوى الرئيسي.

**Props:**
- `children`: محتوى الصفحة
- `navItems`: قائمة عناصر التنقل
- `userInfo`: معلومات المستخدم
- `onLogout`: دالة تسجيل الخروج

## الأدوار المدعومة

### 1. الباحث (Researcher)
- لوحة التحكم
- تقديم بحث جديد
- أبحاثي
- الملف الشخصي
- الإشعارات
- الإعدادات

### 2. المحرر (Editor)
- لوحة التحكم
- إدارة الأبحاث
- إدارة المراجعين
- إدارة الأعداد
- إدارة التقارير
- إدارة المقالات
- الملف الشخصي
- الإشعارات
- الإعدادات

### 3. المحكم (Reviewer)
- لوحة التحكم
- مهامي
- الأبحاث المكتملة
- الملف الشخصي
- الإشعارات
- الإعدادات

### 4. المدير (Admin)
- لوحة التحكم
- إدارة المستخدمين
- إدارة الأبحاث
- إدارة الأعداد
- إدارة المقالات
- التقارير والإحصاءات
- الإشعارات
- الملف الشخصي
- الإعدادات

## الاستخدام

```tsx
import { DashboardLayout } from './components/dashboard';
import { getNavigationByRole } from './data/dashboardNavigation';
import { UserRole } from './types';

function MyDashboard() {
  const navItems = getNavigationByRole(UserRole.RESEARCHER);
  
  return (
    <DashboardLayout
      navItems={navItems}
      userInfo={{
        name: 'أحمد محمد',
        role: 'باحث',
        avatar: '/path/to/avatar.jpg'
      }}
      onLogout={() => console.log('Logout')}
    >
      {/* محتوى الصفحة */}
    </DashboardLayout>
  );
}
```

## التخصيص

يمكنك تخصيص الألوان والأيقونات من خلال:
- تعديل ملف `dashboardNavigation.ts` لتغيير عناصر القائمة
- تعديل مكون `DashboardSidebar.tsx` لتغيير التصميم
- استخدام Tailwind classes لتخصيص الألوان

## الملاحظات

- التصميم يدعم RTL (من اليمين إلى اليسار)
- الـ Sidebar ثابت على الجانب الأيمن
- يتم تحديد العنصر النشط تلقائياً بناءً على المسار الحالي
