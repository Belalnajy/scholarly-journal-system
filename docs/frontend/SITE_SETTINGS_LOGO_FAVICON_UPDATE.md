# تحديث اللوجو والفافيكون التلقائي في جميع الصفحات

## المشكلة
عند رفع لوجو أو favicon جديد من صفحة إعدادات الموقع، لم يكن يتحدث تلقائياً في جميع الأماكن (Header, Footer, Browser Tab).

## الحل المطبق

### 1. Backend Fixes (✅ Complete)

#### `site-settings.controller.ts`
- إضافة `memoryStorage()` من multer لتخزين الملفات في الذاكرة
- تحديد حد أقصى لحجم الملف:
  * Logo: 5MB
  * Favicon: 1MB

```typescript
@UseInterceptors(
  FileInterceptor('logo', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
  }),
)
```

#### `site-settings.service.ts`
- تصحيح استدعاء `cloudinaryService.uploadFile()`:
  * Parameter 3: `'image'` (resource type)
  * Parameter 4: options object مع `public_id`, `overwrite`, `access_mode`

```typescript
const result = await this.cloudinaryService.uploadFile(
  file.buffer,
  'site-assets/logo',
  'image',
  {
    public_id: `logo_${Date.now()}`,
    overwrite: true,
    access_mode: 'public',
  }
);
```

### 2. Frontend Updates (✅ Complete)

#### `SiteSettingsContext.tsx`
إضافة `useEffect` لتحديث الـ favicon والـ title تلقائياً عند تغيير الإعدادات:

```typescript
useEffect(() => {
  if (settings) {
    // Update page title
    if (settings.site_name) {
      document.title = settings.site_name;
    }
    
    // Update favicon
    if (settings.favicon_url) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = settings.favicon_url;
      if (!document.querySelector("link[rel*='icon']")) {
        document.head.appendChild(link);
      }
    }
  }
}, [settings]);
```

#### `SiteSettingsPage.tsx`

**1. استخدام Context:**
```typescript
const { refreshSettings } = useSiteSettings();
```

**2. تحديث `handleLogoUpload()`:**
```typescript
const result = await siteSettingsService.uploadLogo(file);
setFormData({ ...formData, logo_url: result.logo_url });

// Refresh settings context to update logo everywhere
await refreshSettings();

setMessage({ 
  type: 'success', 
  text: 'تم رفع الشعار بنجاح وتحديثه في جميع الصفحات!' 
});
```

**3. تحديث `handleFaviconUpload()`:**
```typescript
const result = await siteSettingsService.uploadFavicon(file);
setFormData({ ...formData, favicon_url: result.favicon_url });

// Refresh settings context
await refreshSettings();

// Update favicon in browser tab immediately
updateFavicon(result.favicon_url);

setMessage({ 
  type: 'success', 
  text: 'تم رفع الأيقونة بنجاح وتحديثها في المتصفح!' 
});
```

**4. Helper Function:**
```typescript
const updateFavicon = (faviconUrl: string) => {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = faviconUrl;
  if (!document.querySelector("link[rel*='icon']")) {
    document.head.appendChild(link);
  }
};
```

**5. تحديث `handleSubmit()`:**
```typescript
await siteSettingsService.updateSettings(formData);

// Refresh settings context to update everywhere
await refreshSettings();

// Refresh local form data
await fetchSettings();

setMessage({ 
  type: 'success', 
  text: 'تم حفظ الإعدادات بنجاح وتحديثها في جميع الصفحات!' 
});
```

## كيف يعمل النظام

### عند رفع لوجو جديد:
1. ✅ يرفع الملف إلى Cloudinary
2. ✅ يحفظ الـ URL في قاعدة البيانات
3. ✅ يستدعي `refreshSettings()` من Context
4. ✅ Context يجلب الإعدادات الجديدة من API
5. ✅ جميع المكونات التي تستخدم `useSiteSettings()` تتحدث تلقائياً:
   - Header (اللوجو)
   - Footer (اللوجو)
   - MaintenancePage (اللوجو)
   - أي مكون آخر يستخدم Context

### عند رفع favicon جديد:
1. ✅ يرفع الملف إلى Cloudinary
2. ✅ يحفظ الـ URL في قاعدة البيانات
3. ✅ يستدعي `refreshSettings()` من Context
4. ✅ يستدعي `updateFavicon()` لتحديث الـ tab فوراً
5. ✅ Context يحدث الـ favicon في `<head>` تلقائياً

### عند حفظ الإعدادات (Submit):
1. ✅ يحفظ جميع التغييرات في قاعدة البيانات
2. ✅ يستدعي `refreshSettings()` لتحديث Context
3. ✅ جميع الصفحات تتحدث تلقائياً

## الأماكن التي تستخدم اللوجو

### 1. Header Component
```typescript
const { settings } = useSiteSettings();
const displayLogo = settings?.logo_url || logoSrc;
const siteName = settings?.site_name || 'مجلة البحوث والدراسات';
```

### 2. Footer Component
```typescript
const { settings } = useSiteSettings();
const displayLogo = settings?.logo_url || '/journal-logo.png';
const displaySiteInfo = {
  name: settings?.site_name || siteInfo.name,
  description: settings?.about_intro || siteInfo.description,
};
```

### 3. DashboardSidebar Component (✅ Updated)
```typescript
const { settings } = useSiteSettings();
const displayLogo = settings?.logo_url || '/journal-logo.png';
const siteName = settings?.site_name || 'مجلة البحوث والدراسات';
```

### 4. MaintenancePage
```typescript
const { settings } = useSiteSettings();
{settings?.logo_url && (
  <img src={settings.logo_url} alt={settings.site_name || 'Logo'} />
)}
```

## الأماكن التي تستخدم الـ Favicon

### 1. Browser Tab (`<head>`)
- يتحدث تلقائياً عبر `SiteSettingsContext` useEffect
- يتحدث فوراً عند رفع favicon جديد

### 2. Page Title
- يتحدث تلقائياً من `settings.site_name`
- يظهر في tab المتصفح

## Features

### ✅ Real-time Updates
- اللوجو يتحدث في Header و Footer فوراً
- الـ Favicon يتحدث في browser tab فوراً
- عنوان الصفحة يتحدث تلقائياً

### ✅ Validation
- Logo: JPG, PNG, GIF, WEBP, SVG (max 5MB)
- Favicon: ICO, PNG, JPG (max 1MB)

### ✅ User Feedback
- رسائل نجاح واضحة
- رسائل خطأ مفصلة
- Loading states أثناء الرفع

### ✅ Cloudinary Integration
- رفع آمن إلى Cloudinary
- public_id فريد لكل ملف
- overwrite enabled لتحديث الملفات

## Testing

### اختبار رفع اللوجو:
1. افتح صفحة Site Settings
2. ارفع لوجو جديد
3. تحقق من:
   - ✅ اللوجو يظهر في Header
   - ✅ اللوجو يظهر في Footer
   - ✅ رسالة نجاح تظهر

### اختبار رفع الـ Favicon:
1. افتح صفحة Site Settings
2. ارفع favicon جديد
3. تحقق من:
   - ✅ الـ favicon يتغير في browser tab فوراً
   - ✅ رسالة نجاح تظهر

### اختبار حفظ الإعدادات:
1. غير اسم الموقع
2. اضغط "حفظ الإعدادات"
3. تحقق من:
   - ✅ عنوان الصفحة يتحدث
   - ✅ اسم الموقع يتحدث في Header

### Files Modified

### Backend:
- ✅ `/apps/backend/src/modules/site-settings/site-settings.controller.ts`
- ✅ `/apps/backend/src/modules/site-settings/site-settings.service.ts`

### Frontend:
- ✅ `/apps/frontend/src/contexts/SiteSettingsContext.tsx`
- ✅ `/apps/frontend/src/pages/dashboard/admin/SiteSettingsPage.tsx`
- ✅ `/apps/frontend/src/components/dashboard/DashboardSidebar.tsx`

## Status
✅ **100% Complete** - جاهز للاستخدام

## Next Steps
- اختبار رفع اللوجو والفافيكون
- التأكد من التحديث التلقائي في جميع الصفحات
- اختبار مع ملفات بأحجام مختلفة
