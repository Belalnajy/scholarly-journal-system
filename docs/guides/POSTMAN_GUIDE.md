# دليل Postman Collection - My Journal API

## 📋 نظرة عامة

هذا الدليل يشرح كيفية استخدام Postman Collection الخاص بـ My Journal API للاختبار الشامل لجميع الـ Endpoints.

## 📦 الملفات المتوفرة

1. **`environment.json`** - Environment Variables
2. **Postman Collection** - سيتم إنشاؤه يدوياً

## 🔧 إعداد البيئة (Environment Setup)

### 1. استيراد Environment

1. افتح Postman
2. اذهب إلى **Environments** → **Import**
3. اختر ملف `environment.json`
4. اختر البيئة "My Journal - Development"

### 2. المتغيرات المتاحة

| Variable | الوصف | مثال |
|----------|-------|------|
| `base_url` | عنوان الـ API | `http://localhost:3000/api` |
| `auth_token` | JWT Token للمصادقة | `eyJhbGciOiJIUzI1NiIs...` |
| `user_id` | معرف المستخدم الحالي | `uuid` |
| `researcher_id` | معرف الباحث | `uuid` |
| `reviewer_id` | معرف المُحكّم | `uuid` |
| `editor_id` | معرف المحرر | `uuid` |
| `admin_id` | معرف المدير | `uuid` |
| `research_id` | معرف البحث | `uuid` |
| `research_number` | رقم البحث | `RES-2025-0001` |
| `file_id` | معرف الملف | `uuid` |
| `revision_id` | معرف التعديل | `uuid` |
| `review_id` | معرف التقييم | `uuid` |
| `assignment_id` | معرف التعيين | `uuid` |
| `notification_id` | معرف الإشعار | `uuid` |
| `contact_id` | معرف رسالة التواصل | `uuid` |
| `field_id` | معرف حقل النشر | `uuid` |

## 📚 الـ API Endpoints

### 1. Users Management (`/users`)

#### Public Endpoints (لا تحتاج Authentication)

**POST `/users`** - إنشاء مستخدم جديد (التسجيل)
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "Password123!",
  "phone": "+201234567890",
  "affiliation": "جامعة القاهرة",
  "role": "researcher",
  "status": "active"
}
```

#### Authenticated Endpoints

**GET `/users`** - عرض جميع المستخدمين
- **Roles**: `admin`, `editor`

**GET `/users/stats`** - إحصائيات المستخدمين
- **Roles**: `admin`, `editor`

**GET `/users/:id`** - عرض مستخدم محدد
- **Roles**: جميع المستخدمين المسجلين

**PATCH `/users/:id`** - تحديث مستخدم
- **Roles**: `admin`, `editor`

**DELETE `/users/:id`** - حذف مستخدم
- **Roles**: `admin`

**POST `/users/:id/verify-password`** - التحقق من كلمة المرور
```json
{
  "password": "Password123!"
}
```

**POST `/users/:id/upload-avatar`** - رفع صورة شخصية
- **Body**: `multipart/form-data`
- **Field**: `file` (image file)

**DELETE `/users/:id/avatar`** - حذف الصورة الشخصية

**GET `/users/:id/avatar-url`** - الحصول على رابط الصورة
- **Query**: `width`, `height`

---

### 2. Research Management (`/research`)

**POST `/research`** - إنشاء بحث جديد
- **Roles**: `researcher`, `admin`, `editor`
```json
{
  "user_id": "{{user_id}}",
  "research_number": "RES-2025-0001",
  "title": "عنوان البحث",
  "title_en": "Research Title",
  "abstract": "ملخص البحث",
  "abstract_en": "Research Abstract",
  "keywords": ["كلمة1", "كلمة2"],
  "keywords_en": ["keyword1", "keyword2"],
  "specialization": "علوم الحاسب",
  "status": "under-review"
}
```

**GET `/research`** - عرض جميع الأبحاث
- **Roles**: `researcher`, `reviewer`, `editor`, `admin`
- **Query**: `user_id`, `status`, `specialization`

**GET `/research/stats`** - إحصائيات الأبحاث
- **Query**: `user_id`

**GET `/research/number/:research_number`** - البحث برقم البحث

**GET `/research/:id`** - عرض بحث محدد

**PATCH `/research/:id`** - تحديث بحث
- **Roles**: `researcher`, `admin`, `editor`

**PATCH `/research/:id/status`** - تغيير حالة البحث
- **Roles**: `admin`, `editor`
```json
{
  "status": "accepted"
}
```

**DELETE `/research/:id`** - حذف بحث
- **Roles**: `admin`

#### File Management

**POST `/research/:id/upload-pdf`** - رفع ملف PDF
- **Roles**: `researcher`, `admin`, `editor`
- **Body**: `multipart/form-data`

**POST `/research/:id/upload-supplementary`** - رفع ملف إضافي
- **Roles**: `researcher`, `admin`, `editor`
- **Body**: `multipart/form-data` + `category`

**GET `/research/:id/files`** - عرض ملفات البحث

**GET `/research/:id/pdf-download-url`** - رابط تحميل PDF

**GET `/research/:id/pdf-view-url`** - رابط عرض PDF

**GET `/research/:id/pdf-thumbnail`** - صورة مصغرة للـ PDF
- **Query**: `page` (default: 1)

**GET `/research/files/:file_id/download-url`** - رابط تحميل ملف

**DELETE `/research/files/:file_id`** - حذف ملف

---

### 3. Research Revisions (`/research-revisions`)

**POST `/research-revisions`** - إنشاء طلب تعديل
- **Roles**: `admin`, `editor`
```json
{
  "research_id": "{{research_id}}",
  "revision_notes": "ملاحظات التعديل",
  "original_data": {
    "abstract": "الملخص الأصلي",
    "keywords": ["كلمة1", "كلمة2"],
    "file_url": "https://...",
    "cloudinary_secure_url": "https://..."
  },
  "deadline": "2025-12-31T23:59:59Z"
}
```

**GET `/research-revisions`** - عرض جميع التعديلات
- **Roles**: `researcher`, `editor`, `admin`
- **Query**: `research_id`, `status`

**GET `/research-revisions/:id`** - عرض تعديل محدد

**PUT `/research-revisions/:id`** - تحديث تعديل

**POST `/research-revisions/:id/upload-file`** - رفع ملف التعديل
- **Roles**: `researcher`, `admin`, `editor`

**PUT `/research-revisions/:id/submit`** - إرسال التعديل
- **Roles**: `researcher`, `admin`, `editor`

**PUT `/research-revisions/:id/approve`** - الموافقة على التعديل
- **Roles**: `admin`, `editor`

**PUT `/research-revisions/:id/reject`** - رفض التعديل
- **Roles**: `admin`, `editor`

**GET `/research-revisions/:id/download-url`** - رابط تحميل التعديل

**DELETE `/research-revisions/:id`** - حذف تعديل
- **Roles**: `admin`

---

### 4. Reviews Management (`/reviews`)

**POST `/reviews`** - إنشاء تقييم
- **Roles**: `reviewer`, `admin`, `editor`
```json
{
  "research_id": "{{research_id}}",
  "reviewer_id": "{{reviewer_id}}",
  "originality_rating": 4,
  "methodology_rating": 5,
  "clarity_rating": 4,
  "contribution_rating": 4,
  "overall_rating": 4,
  "comments": "تعليقات التقييم",
  "recommendation": "accept",
  "status": "completed"
}
```

**GET `/reviews`** - عرض جميع التقييمات
- **Roles**: `reviewer`, `editor`, `admin`
- **Query**: `research_id`, `reviewer_id`, `status`

**GET `/reviews/stats/:research_id`** - إحصائيات تقييمات البحث

**GET `/reviews/:id`** - عرض تقييم محدد

**PATCH `/reviews/:id`** - تحديث تقييم
- **Roles**: `reviewer`, `admin`, `editor`

**PATCH `/reviews/:id/status`** - تغيير حالة التقييم

**DELETE `/reviews/:id`** - حذف تقييم
- **Roles**: `admin`

---

### 5. Reviewer Assignments (`/reviewer-assignments`)

**POST `/reviewer-assignments`** - تعيين مُحكّم
- **Roles**: `admin`, `editor`
```json
{
  "research_id": "{{research_id}}",
  "reviewer_id": "{{reviewer_id}}",
  "assigned_date": "2025-01-23T00:00:00Z",
  "due_date": "2025-02-23T23:59:59Z",
  "status": "pending"
}
```

**GET `/reviewer-assignments`** - عرض جميع التعيينات
- **Roles**: `reviewer`, `editor`, `admin`
- **Query**: `research_id`, `reviewer_id`, `status`

**GET `/reviewer-assignments/stats/:reviewer_id`** - إحصائيات المُحكّم

**GET `/reviewer-assignments/:id`** - عرض تعيين محدد

**PATCH `/reviewer-assignments/:id`** - تحديث تعيين
- **Roles**: `reviewer`, `admin`, `editor`

**PATCH `/reviewer-assignments/:id/status`** - تغيير حالة التعيين

**DELETE `/reviewer-assignments/:id`** - حذف تعيين
- **Roles**: `admin`

---

### 6. Notifications (`/notifications`)

**POST `/notifications`** - إنشاء إشعار
```json
{
  "user_id": "{{user_id}}",
  "type": "research_status_change",
  "title": "عنوان الإشعار",
  "message": "محتوى الإشعار",
  "link": "/research/{{research_id}}"
}
```

**GET `/notifications`** - عرض جميع الإشعارات
- **Query**: `user_id`, `is_read`, `type`

**GET `/notifications/user/:userId`** - إشعارات مستخدم محدد

**GET `/notifications/user/:userId/unread-count`** - عدد الإشعارات غير المقروءة

**PATCH `/notifications/:id/read`** - تحديد إشعار كمقروء

**PATCH `/notifications/read-all`** - تحديد جميع الإشعارات كمقروءة
- **Query**: `user_id`

**DELETE `/notifications/read`** - حذف الإشعارات المقروءة
- **Query**: `user_id`

**GET `/notifications/:id`** - عرض إشعار محدد

**PATCH `/notifications/:id`** - تحديث إشعار

**DELETE `/notifications/:id`** - حذف إشعار

**POST `/notifications/broadcast`** - إرسال إشعار لجميع المستخدمين
- **Roles**: `admin`
```json
{
  "type": "system_announcement",
  "title": "إعلان هام",
  "message": "محتوى الإعلان",
  "link": "/announcements"
}
```

---

### 7. Site Settings (`/site-settings`)

**GET `/site-settings`** - عرض جميع الإعدادات
- **Roles**: `admin`, `editor`

**GET `/site-settings/public`** - عرض الإعدادات العامة
- **Public** - لا تحتاج authentication

**PATCH `/site-settings`** - تحديث الإعدادات
- **Roles**: `admin`
```json
{
  "site_name": "مجلة البحث العلمي",
  "site_description": "وصف المجلة",
  "contact_email": "info@journal.com",
  "contact_phone": "+201234567890",
  "maintenance_mode": false
}
```

**POST `/site-settings/maintenance-mode`** - تفعيل/إلغاء وضع الصيانة
- **Roles**: `admin`
```json
{
  "enabled": true
}
```

---

### 8. Publication Fields (`/publication-fields`)

**POST `/publication-fields`** - إنشاء حقل نشر
```json
{
  "field_name_ar": "اسم الحقل بالعربية",
  "field_name_en": "Field Name in English",
  "field_key": "field_key",
  "field_type": "text",
  "is_required": true,
  "is_active": true,
  "display_order": 1
}
```

**GET `/publication-fields`** - عرض جميع الحقول

**GET `/publication-fields/active`** - عرض الحقول النشطة فقط

**GET `/publication-fields/stats`** - إحصائيات الحقول

**GET `/publication-fields/:id`** - عرض حقل محدد

**PATCH `/publication-fields/:id`** - تحديث حقل

**DELETE `/publication-fields/:id`** - حذف حقل

**POST `/publication-fields/:id/toggle-active`** - تفعيل/إلغاء تفعيل حقل

**POST `/publication-fields/reorder`** - إعادة ترتيب الحقول
```json
{
  "orderedIds": ["id1", "id2", "id3"]
}
```

---

### 9. Contact Submissions (`/contact-submissions`)

**POST `/contact-submissions`** - إنشاء رسالة تواصل
```json
{
  "name": "الاسم",
  "email": "email@example.com",
  "subject": "الموضوع",
  "message": "محتوى الرسالة",
  "user_id": "{{user_id}}"
}
```

**GET `/contact-submissions`** - عرض جميع الرسائل
- **Query**: `status`, `user_id`

**GET `/contact-submissions/stats`** - إحصائيات الرسائل

**GET `/contact-submissions/pending-count`** - عدد الرسائل المعلقة

**GET `/contact-submissions/user/:userId`** - رسائل مستخدم محدد

**PATCH `/contact-submissions/:id/status`** - تغيير حالة الرسالة
```json
{
  "status": "resolved"
}
```

**GET `/contact-submissions/:id`** - عرض رسالة محددة

**PATCH `/contact-submissions/:id`** - تحديث رسالة

**DELETE `/contact-submissions/:id`** - حذف رسالة

---

## 🔐 Authentication

### إعداد الـ Token

1. قم بالتسجيل أو تسجيل الدخول (عندما يتم إضافة Auth endpoints)
2. احصل على الـ JWT Token
3. ضعه في Environment Variable `auth_token`
4. سيتم إضافته تلقائياً في Header:
   ```
   Authorization: Bearer {{auth_token}}
   ```

### الأدوار والصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| **admin** | جميع الصلاحيات |
| **editor** | إدارة الأبحاث، المراجعين، الإعدادات |
| **reviewer** | مراجعة الأبحاث، إضافة تقييمات |
| **researcher** | تقديم الأبحاث، التعديلات |

---

## 🧪 سيناريوهات الاختبار

### 1. تسجيل باحث جديد وتقديم بحث

```
1. POST /users (إنشاء باحث)
   → احفظ user_id
2. POST /research (إنشاء بحث)
   → احفظ research_id
3. POST /research/:id/upload-pdf (رفع PDF)
4. GET /research/:id (عرض البحث)
```

### 2. تعيين مُحكّم ومراجعة البحث

```
1. POST /users (إنشاء مُحكّم)
   → احفظ reviewer_id
2. POST /reviewer-assignments (تعيين المُحكّم)
   → احفظ assignment_id
3. POST /reviews (إضافة تقييم)
   → احفظ review_id
4. GET /reviews/stats/:research_id (عرض الإحصائيات)
```

### 3. طلب تعديل وإرسال التعديل

```
1. POST /research-revisions (طلب تعديل)
   → احفظ revision_id
2. POST /research-revisions/:id/upload-file (رفع ملف التعديل)
3. PUT /research-revisions/:id/submit (إرسال التعديل)
4. PUT /research-revisions/:id/approve (الموافقة)
```

---

## 📝 ملاحظات مهمة

### 1. الـ Base URL

تأكد من تشغيل الـ Backend على:
```
http://localhost:3000
```

الـ API متاح على:
```
http://localhost:3000/api
```

### 2. Content-Type Headers

- **JSON Requests**: `Content-Type: application/json`
- **File Uploads**: `Content-Type: multipart/form-data`

### 3. Auto-Save Variables

بعض الـ Requests تحفظ المتغيرات تلقائياً في Environment:
- `user_id` بعد إنشاء مستخدم
- `research_id` بعد إنشاء بحث
- `file_id` بعد رفع ملف
- إلخ...

### 4. Error Responses

جميع الأخطاء تُرجع بصيغة:
```json
{
  "statusCode": 400,
  "message": "رسالة الخطأ",
  "error": "Bad Request"
}
```

---

## 🚀 البدء السريع

1. **استيراد Environment**
   ```
   Postman → Environments → Import → environment.json
   ```

2. **إنشاء Collection يدوياً**
   - استخدم الـ Endpoints المذكورة أعلاه
   - أضف Authentication: Bearer Token
   - استخدم `{{base_url}}` في جميع الـ URLs

3. **اختبار الـ API**
   - ابدأ بإنشاء مستخدم
   - قم بتسجيل الدخول (عندما يتوفر)
   - اختبر باقي الـ Endpoints

---

**تم التطوير بواسطة:** Cascade AI  
**التاريخ:** 2025-01-23  
**الإصدار:** 1.0.0
