# 🎯 Site Settings & Publication Fields Modules

تم إنشاء modules جديدة للـ backend باتباع best practices في NestJS.

## 📦 الـ Modules المُنشأة

### 1. 🌐 Site Settings Module

**الغرض:** إدارة إعدادات الموقع (Singleton Pattern)

**الملفات المُنشأة:**
```
apps/backend/src/
├── database/entities/
│   └── site-settings.entity.ts
└── modules/site-settings/
    ├── dto/
    │   └── update-site-settings.dto.ts
    ├── site-settings.controller.ts
    ├── site-settings.service.ts
    └── site-settings.module.ts
```

**الـ Endpoints:**

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/site-settings` | الحصول على الإعدادات (Admin) |
| GET | `/site-settings/public` | الحصول على الإعدادات العامة (Frontend) |
| PATCH | `/site-settings` | تحديث الإعدادات |
| POST | `/site-settings/maintenance-mode` | تفعيل/تعطيل وضع الصيانة |

**الـ Features:**
- ✅ Singleton Pattern - صف واحد فقط في الجدول
- ✅ Auto-create default settings
- ✅ Public vs Admin endpoints
- ✅ Maintenance mode support
- ✅ JSON fields للمرونة (goals, contact_info, social_links)

**مثال على الاستخدام:**

```typescript
// Get public settings
GET /site-settings/public

// Update settings
PATCH /site-settings
{
  "site_name": "مجلة الدراسات والبحوث",
  "mission": "نشر الأبحاث العلمية المحكمة",
  "contact_info": {
    "email": "info@journal.com",
    "phone": "+966123456789"
  }
}

// Toggle maintenance mode
POST /site-settings/maintenance-mode
{
  "enabled": true
}
```

---

### 2. 📚 Publication Fields Module

**الغرض:** إدارة مجالات النشر/التخصصات

**الملفات المُنشأة:**
```
apps/backend/src/
├── database/entities/
│   └── publication-field.entity.ts
└── modules/publication-fields/
    ├── dto/
    │   ├── create-publication-field.dto.ts
    │   └── update-publication-field.dto.ts
    ├── publication-fields.controller.ts
    ├── publication-fields.service.ts
    └── publication-fields.module.ts
```

**الـ Endpoints:**

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/publication-fields` | إنشاء مجال جديد |
| GET | `/publication-fields` | الحصول على جميع المجالات |
| GET | `/publication-fields/active` | الحصول على المجالات النشطة فقط |
| GET | `/publication-fields/stats` | إحصائيات المجالات |
| GET | `/publication-fields/:id` | الحصول على مجال محدد |
| PATCH | `/publication-fields/:id` | تحديث مجال |
| DELETE | `/publication-fields/:id` | حذف مجال |
| POST | `/publication-fields/:id/toggle-active` | تفعيل/تعطيل مجال |
| POST | `/publication-fields/reorder` | إعادة ترتيب المجالات |

**الـ Features:**
- ✅ CRUD operations كاملة
- ✅ Bilingual support (Arabic + English)
- ✅ Display order management
- ✅ Active/Inactive status
- ✅ Reorder functionality
- ✅ Statistics endpoint
- ✅ Duplicate name validation

**مثال على الاستخدام:**

```typescript
// Create new field
POST /publication-fields
{
  "name_ar": "علوم الحاسب",
  "name_en": "Computer Science",
  "description_ar": "أبحاث في مجال علوم الحاسب",
  "display_order": 1,
  "is_active": true
}

// Get active fields
GET /publication-fields/active

// Toggle active status
POST /publication-fields/:id/toggle-active

// Reorder fields
POST /publication-fields/reorder
{
  "orderedIds": ["uuid1", "uuid2", "uuid3"]
}

// Get statistics
GET /publication-fields/stats
// Response: { total: 10, active: 8, inactive: 2 }
```

---

## 🏗️ Best Practices المُتبعة

### 1. **Architecture Pattern**
- ✅ Module-based architecture
- ✅ Separation of concerns (Entity, DTO, Service, Controller, Module)
- ✅ Dependency injection
- ✅ Repository pattern

### 2. **Entity Design**
- ✅ TypeORM decorators
- ✅ UUID primary keys
- ✅ Timestamps (created_at, updated_at)
- ✅ Proper column types
- ✅ JSON fields للبيانات المرنة

### 3. **DTOs & Validation**
- ✅ Class-validator decorators
- ✅ Separate Create/Update DTOs
- ✅ PartialType للـ Update DTOs
- ✅ Arabic error messages

### 4. **Service Layer**
- ✅ Business logic separation
- ✅ Error handling (NotFoundException, ConflictException)
- ✅ Async/await
- ✅ Repository injection
- ✅ Helper methods (stats, toggle, reorder)

### 5. **Controller Layer**
- ✅ RESTful endpoints
- ✅ Proper HTTP methods
- ✅ Route decorators
- ✅ Body/Param decorators
- ✅ Clear endpoint naming

### 6. **Module Configuration**
- ✅ TypeOrmModule.forFeature للـ entities
- ✅ Export services للاستخدام في modules أخرى
- ✅ Proper imports/exports

---

## 🔄 التكامل مع الـ App Module

تم تحديث `app.module.ts` لإضافة الـ modules الجديدة:

```typescript
@Module({
  imports: [
    // ... existing modules
    SiteSettingsModule,
    PublicationFieldsModule,
  ],
})
export class AppModule {}
```

---

## 📊 Database Schema

### Site Settings Table
```sql
CREATE TABLE site_settings (
    id UUID PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'مجلة الدراسات والبحوث',
    site_name_en VARCHAR(255),
    logo_url TEXT,
    favicon_url TEXT,
    about_intro TEXT,
    mission TEXT,
    vision TEXT,
    goals JSON,
    contact_info JSON,
    social_links JSON,
    is_maintenance_mode BOOLEAN DEFAULT FALSE,
    maintenance_message TEXT,
    updated_at TIMESTAMP
);
```

### Publication Fields Table
```sql
CREATE TABLE publication_fields (
    id UUID PRIMARY KEY,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    description_ar TEXT,
    description_en TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🚀 الخطوات التالية

1. **تشغيل الـ Backend:**
   ```bash
   cd apps/backend
   npm run start:dev
   ```

2. **إنشاء الجداول:**
   - الجداول ستُنشأ تلقائياً بفضل `synchronize: true`
   - في Production، استخدم migrations

3. **اختبار الـ Endpoints:**
   ```bash
   # Test site settings
   curl http://localhost:3000/site-settings/public
   
   # Test publication fields
   curl http://localhost:3000/publication-fields/active
   ```

4. **إضافة Authentication/Authorization:**
   - حماية الـ endpoints الإدارية
   - استخدام Guards (AuthGuard, RolesGuard)

5. **إضافة Validation Pipes:**
   ```typescript
   app.useGlobalPipes(new ValidationPipe());
   ```

---

## 📝 ملاحظات مهمة

1. **Singleton Pattern للـ Site Settings:**
   - يجب أن يكون هناك صف واحد فقط
   - الـ Service يُنشئ إعدادات افتراضية تلقائياً

2. **Publication Fields Ordering:**
   - استخدم `display_order` للترتيب
   - استخدم endpoint `/reorder` لإعادة الترتيب

3. **Bilingual Support:**
   - جميع الحقول تدعم العربية والإنجليزية
   - الحقول العربية إلزامية، الإنجليزية اختيارية

4. **JSON Fields:**
   - `goals`: Array of strings
   - `contact_info`: Object with email, phone, address, fax
   - `social_links`: Object with social media links

---

## ✅ الملفات المُحدّثة

- ✅ `app.module.ts` - إضافة الـ modules الجديدة
- ✅ `entities/index.ts` - تصدير الـ entities الجديدة

---

## 🎉 النتيجة

تم إنشاء modules احترافية باتباع best practices:
- ✅ Clean Architecture
- ✅ SOLID Principles
- ✅ TypeScript Best Practices
- ✅ NestJS Conventions
- ✅ RESTful API Design
- ✅ Error Handling
- ✅ Validation
- ✅ Documentation
