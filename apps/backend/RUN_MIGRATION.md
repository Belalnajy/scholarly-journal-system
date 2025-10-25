# تشغيل Migration لإضافة حقول Cloudinary

## الخطوات المطلوبة

### 1. التأكد من تشغيل Database
تأكد من أن PostgreSQL يعمل:

```bash
# التحقق من حالة PostgreSQL
sudo systemctl status postgresql

# إذا لم يكن يعمل، قم بتشغيله
sudo systemctl start postgresql
```

### 2. تشغيل Migration

```bash
# الانتقال إلى مجلد backend
cd apps/backend

# تشغيل migration
npm run typeorm migration:run

# أو من الجذر
npx typeorm migration:run -d apps/backend/src/config/database.config.ts
```

### 3. التحقق من نجاح Migration

بعد تشغيل Migration، يجب أن ترى رسالة مثل:

```
Migration AddCloudinaryFields1729681348000 has been executed successfully.
```

### 4. التحقق من الحقول الجديدة

يمكنك التحقق من إضافة الحقول في Database:

```sql
-- التحقق من جدول research
\d research

-- التحقق من جدول research_files
\d research_files

-- التحقق من جدول users
\d users
```

يجب أن ترى الحقول التالية:

**في جدول `research`:**
- `cloudinary_public_id` (text)
- `cloudinary_secure_url` (text)

**في جدول `research_files`:**
- `cloudinary_public_id` (text)
- `cloudinary_secure_url` (text)
- `cloudinary_format` (text)
- `cloudinary_resource_type` (text)

**في جدول `users`:**
- `avatar_cloudinary_public_id` (text)
- `avatar_cloudinary_secure_url` (text)

---

## في حالة حدوث مشاكل

### مشكلة: "Migration has already been executed"

إذا كانت Migration قد تم تشغيلها من قبل:

```bash
# عرض قائمة Migrations
npm run typeorm migration:show

# إذا كنت تريد إعادة تشغيلها، قم بالتراجع أولاً
npm run typeorm migration:revert
```

### مشكلة: "Connection refused"

تأكد من:
1. PostgreSQL يعمل
2. معلومات الاتصال في `.env` صحيحة:
   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=journal_user
   DATABASE_PASSWORD=123456
   DATABASE_NAME=journal_db
   ```

### مشكلة: "Database does not exist"

قم بإنشاء Database:

```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# إنشاء Database
CREATE DATABASE journal_db;

# إنشاء User
CREATE USER journal_user WITH PASSWORD '123456';

# منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE journal_db TO journal_user;

# الخروج
\q
```

---

## بعد نجاح Migration

يمكنك الآن:

1. ✅ تشغيل Backend:
   ```bash
   npm run serve backend
   ```

2. ✅ اختبار رفع الملفات:
   - رفع PDF للبحث
   - رفع صورة شخصية
   - رفع ملفات إضافية

3. ✅ التحقق من Cloudinary Dashboard:
   - افتح: https://console.cloudinary.com/
   - تحقق من رفع الملفات بنجاح

---

## أوامر مفيدة

```bash
# عرض قائمة Migrations
npm run typeorm migration:show

# إنشاء migration جديد
npm run typeorm migration:create -- -n MigrationName

# التراجع عن آخر migration
npm run typeorm migration:revert

# تشغيل جميع Migrations
npm run typeorm migration:run
```

---

## ملاحظات

- ⚠️ تأكد من عمل backup للـ database قبل تشغيل migration في production
- ✅ Migration آمن ولن يحذف أي بيانات موجودة
- ✅ جميع الحقول الجديدة nullable، لذلك لن تؤثر على البيانات الحالية
