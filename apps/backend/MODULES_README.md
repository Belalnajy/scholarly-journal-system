# Backend Modules Documentation

## 📋 Overview

تم إنشاء ثلاثة modules جديدة في الـ Backend حسب الـ `DATABASE_SCHEMA.md`:

1. **Activity Logs** - سجلات النشاط
2. **Notifications** - الإشعارات
3. **Contact Submissions** - رسائل التواصل

---

## 🔍 1. Activity Logs Module

### الغرض
تسجيل جميع الأنشطة والإجراءات التي يقوم بها المستخدمون في النظام.

### Entity Structure
```typescript
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users)
- research_id: UUID (Optional, Foreign Key → research)
- action_type: Enum (ActivityAction)
- description: Text
- metadata: JSON (Optional)
- created_at: Timestamp
```

### Activity Actions (Enum)
```typescript
// User Actions
USER_LOGIN, USER_LOGOUT, USER_REGISTER, USER_UPDATE_PROFILE

// Research Actions
RESEARCH_SUBMIT, RESEARCH_UPDATE, RESEARCH_DELETE, 
RESEARCH_ACCEPT, RESEARCH_REJECT, RESEARCH_PUBLISH

// Review Actions
REVIEW_ASSIGN, REVIEW_SUBMIT, REVIEW_UPDATE

// Admin Actions
USER_CREATE, USER_UPDATE, USER_DELETE, USER_STATUS_CHANGE

// Other Actions
FILE_UPLOAD, FILE_DELETE, SETTINGS_UPDATE
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/activity-logs` | إنشاء سجل نشاط جديد |
| GET | `/activity-logs` | الحصول على جميع السجلات (مع filters) |
| GET | `/activity-logs/stats` | إحصائيات النشاط |
| GET | `/activity-logs/user/:userId` | سجلات نشاط مستخدم معين |
| GET | `/activity-logs/research/:researchId` | سجلات نشاط بحث معين |
| GET | `/activity-logs/:id` | الحصول على سجل واحد |
| PATCH | `/activity-logs/:id` | تحديث سجل نشاط |
| DELETE | `/activity-logs/:id` | حذف سجل نشاط |

### Query Parameters
- `user_id`: تصفية حسب المستخدم
- `research_id`: تصفية حسب البحث
- `action_type`: تصفية حسب نوع الإجراء
- `limit`: عدد النتائج

### Example Usage
```typescript
// Create activity log
POST /activity-logs
{
  "user_id": "uuid",
  "action_type": "USER_LOGIN",
  "description": "تسجيل دخول المستخدم",
  "metadata": { "ip": "192.168.1.1" }
}

// Get user activities
GET /activity-logs/user/uuid?limit=50
```

---

## 🔔 2. Notifications Module

### الغرض
إدارة الإشعارات المرسلة للمستخدمين.

### Entity Structure
```typescript
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → users)
- type: Enum (NotificationType)
- title: String (max 255)
- message: Text
- action_url: String (Optional, max 500)
- is_read: Boolean (default: false)
- created_at: Timestamp
- read_at: Timestamp (Optional)
```

### Notification Types (Enum)
```typescript
// Research Notifications
RESEARCH_SUBMITTED, RESEARCH_ACCEPTED, RESEARCH_REJECTED,
RESEARCH_PUBLISHED, RESEARCH_REVISION_REQUIRED

// Review Notifications
REVIEW_ASSIGNED, REVIEW_SUBMITTED, REVIEW_REMINDER

// User Notifications
ACCOUNT_CREATED, ACCOUNT_APPROVED, ACCOUNT_SUSPENDED, PASSWORD_CHANGED

// System Notifications
SYSTEM_ANNOUNCEMENT, SYSTEM_MAINTENANCE

// Other
GENERAL
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notifications` | إنشاء إشعار جديد |
| GET | `/notifications` | الحصول على جميع الإشعارات (مع filters) |
| GET | `/notifications/user/:userId` | إشعارات مستخدم معين |
| GET | `/notifications/user/:userId/unread-count` | عدد الإشعارات غير المقروءة |
| POST | `/notifications/:id/mark-as-read` | تحديد إشعار كمقروء |
| POST | `/notifications/user/:userId/mark-all-as-read` | تحديد جميع الإشعارات كمقروءة |
| DELETE | `/notifications/user/:userId/read` | حذف جميع الإشعارات المقروءة |
| GET | `/notifications/:id` | الحصول على إشعار واحد |
| PATCH | `/notifications/:id` | تحديث إشعار |
| DELETE | `/notifications/:id` | حذف إشعار |

### Query Parameters
- `user_id`: تصفية حسب المستخدم
- `is_read`: تصفية حسب حالة القراءة (true/false)
- `type`: تصفية حسب نوع الإشعار

### Example Usage
```typescript
// Create notification
POST /notifications
{
  "user_id": "uuid",
  "type": "RESEARCH_ACCEPTED",
  "title": "تم قبول البحث",
  "message": "تم قبول بحثك للنشر",
  "action_url": "/dashboard/research/uuid"
}

// Get unread notifications
GET /notifications?user_id=uuid&is_read=false

// Mark as read
POST /notifications/uuid/mark-as-read
```

---

## 📧 3. Contact Submissions Module

### الغرض
إدارة رسائل التواصل المرسلة من المستخدمين.

### Entity Structure
```typescript
- id: UUID (Primary Key)
- user_id: UUID (Optional, Foreign Key → users)
- name: String (max 255)
- email: String (max 255)
- subject: String (max 500)
- message: Text
- status: Enum (ContactSubmissionStatus)
- submitted_at: Timestamp
- responded_at: Timestamp (Optional)
```

### Contact Submission Status (Enum)
```typescript
PENDING       // قيد الانتظار
IN_PROGRESS   // قيد المعالجة
RESOLVED      // تم الحل
CLOSED        // مغلق
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact-submissions` | إنشاء رسالة تواصل جديدة |
| GET | `/contact-submissions` | الحصول على جميع الرسائل (مع filters) |
| GET | `/contact-submissions/stats` | إحصائيات الرسائل |
| GET | `/contact-submissions/pending-count` | عدد الرسائل قيد الانتظار |
| GET | `/contact-submissions/user/:userId` | رسائل مستخدم معين |
| PATCH | `/contact-submissions/:id/status` | تحديث حالة الرسالة |
| GET | `/contact-submissions/:id` | الحصول على رسالة واحدة |
| PATCH | `/contact-submissions/:id` | تحديث رسالة |
| DELETE | `/contact-submissions/:id` | حذف رسالة |

### Query Parameters
- `status`: تصفية حسب الحالة
- `user_id`: تصفية حسب المستخدم

### Example Usage
```typescript
// Create contact submission (Guest or User)
POST /contact-submissions
{
  "user_id": "uuid",  // Optional
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "subject": "استفسار عن النشر",
  "message": "أريد الاستفسار عن..."
}

// Get pending submissions
GET /contact-submissions?status=pending

// Update status
PATCH /contact-submissions/uuid/status
{
  "status": "in_progress"
}

// Get stats
GET /contact-submissions/stats
// Returns: { total, pending, inProgress, resolved, closed }
```

---

## 🏗️ Architecture & Best Practices

### 1. **Separation of Concerns**
- **Entities**: في `database/entities/` - منفصلة عن الـ modules
- **DTOs**: في كل module - للـ validation
- **Services**: Business logic
- **Controllers**: HTTP endpoints

### 2. **TypeORM Integration**
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [Controller],
  providers: [Service],
  exports: [Service], // للاستخدام في modules أخرى
})
```

### 3. **Validation**
استخدام `class-validator` decorators في الـ DTOs:
```typescript
@IsUUID('4', { message: 'معرف المستخدم غير صحيح' })
@IsEnum(Type, { message: 'النوع غير صحيح' })
@MaxLength(255, { message: 'يجب ألا يتجاوز 255 حرفاً' })
```

### 4. **Error Handling**
```typescript
throw new NotFoundException('الرسالة غير موجودة');
throw new ConflictException('البيانات موجودة بالفعل');
```

### 5. **Relations**
```typescript
@ManyToOne(() => User, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'user_id' })
user!: User;
```

### 6. **Query Building**
```typescript
const query = repository.createQueryBuilder('alias')
  .leftJoinAndSelect('alias.user', 'user')
  .where('alias.status = :status', { status })
  .orderBy('alias.created_at', 'DESC');
```

---

## 🔄 Database Synchronization

الـ entities ستُنشأ تلقائياً في قاعدة البيانات عند تشغيل الـ Backend بفضل:

```typescript
// database.config.ts
synchronize: true  // ⚠️ للتطوير فقط!
autoLoadEntities: true
```

**⚠️ ملاحظة مهمة**: في الـ Production، يجب:
1. تعطيل `synchronize: false`
2. استخدام migrations بدلاً من ذلك

---

## 🚀 Next Steps

### للتطوير المستقبلي:
1. **Migrations**: إنشاء migrations للـ entities الجديدة
2. **Guards**: إضافة authentication/authorization guards
3. **Interceptors**: logging interceptor للـ activity logs
4. **WebSockets**: real-time notifications
5. **Email Service**: إرسال إشعارات عبر البريد
6. **Pagination**: إضافة pagination للـ queries الكبيرة
7. **Caching**: استخدام Redis للـ caching
8. **Tests**: كتابة unit & integration tests

---

## 📝 Notes

- جميع الـ IDs من نوع UUID
- جميع الـ timestamps تُحفظ تلقائياً
- الـ relations محددة مع `onDelete` strategies
- الـ services exportable للاستخدام في modules أخرى
- الـ DTOs تحتوي على validation messages بالعربية
