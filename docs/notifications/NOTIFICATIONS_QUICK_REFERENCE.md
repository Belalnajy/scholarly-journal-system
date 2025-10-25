# 🔔 مرجع سريع - نظام الإشعارات

## جدول الإشعارات الكامل

| # | الحدث | المستلمون | العنوان | الرسالة | الملف | الدالة |
|---|-------|-----------|---------|---------|-------|--------|
| 1 | **إرسال بحث** | محرر + أدمن | بحث جديد تم إرساله | تم إرسال بحث جديد: {title} | `research.service.ts` | `create()` |
| 2 | **تعيين محكم** | محكم | تم تعيينك كمحكم | تم تعيينك لمراجعة بحث: {title} | `reviewer-assignments.service.ts` | `create()` |
| 3 | **إرسال تقييم** | باحث + محرر + أدمن | تم استلام تقييم جديد | تم استلام تقييم لبحثك: {title} | `reviews.service.ts` | `create()` |
| 4 | **طلب تعديلات** | باحث | مطلوب تعديلات على بحثك | يرجى إجراء تعديلات على بحثك: {title} | `research.service.ts` | `updateStatus()` |
| 5 | **إرسال تعديلات** | محكم + محرر + أدمن | تم إرسال نسخة معدلة | تم إرسال نسخة معدلة من البحث: {title} | `research-revisions.service.ts` | `submitRevision()` |
| 6 | **قبول بحث** | باحث | 🎉 تم قبول بحثك! | تهانينا! تم قبول بحثك: {title} | `research.service.ts` | `updateStatus()` |
| 7 | **رفض بحث** | باحث | قرار بخصوص بحثك | نأسف لإبلاغك بأن بحثك: {title} لم يتم قبوله | `research.service.ts` | `updateStatus()` |
| 8 | **نشر بحث** | باحث | 🎊 تم نشر بحثك! | تم نشر بحثك: {title} في المجلة | `research.service.ts` | `updateStatus()` |

---

## الدوال في NotificationsService

```typescript
// Backend: apps/backend/src/modules/notifications/notifications.service.ts

✅ notifyResearchSubmitted(researchId, researchTitle, researcherId)
✅ notifyReviewerAssigned(researchId, researchTitle, reviewerId)
✅ notifyReviewSubmitted(researchId, researchTitle, researcherId)
✅ notifyRevisionRequested(researchId, researchTitle, researcherId)
✅ notifyRevisionSubmitted(researchId, researchTitle, reviewerIds[])
✅ notifyResearchAccepted(researchId, researchTitle, researcherId)
✅ notifyResearchRejected(researchId, researchTitle, researcherId)
✅ notifyResearchPublished(researchId, researchTitle, researcherId)
```

---

## API Endpoints

```typescript
// Backend: apps/backend/src/modules/notifications/notifications.controller.ts

GET    /api/notifications                    // جلب جميع الإشعارات
GET    /api/notifications/user/:userId       // جلب إشعارات مستخدم
GET    /api/notifications/user/:userId/unread-count  // عدد غير المقروءة
GET    /api/notifications/:id                // جلب إشعار واحد
POST   /api/notifications                    // إنشاء إشعار
PATCH  /api/notifications/:id                // تحديث إشعار
PATCH  /api/notifications/:id/read           // تعليم كمقروء
PATCH  /api/notifications/read-all           // تعليم الكل كمقروء
DELETE /api/notifications/:id                // حذف إشعار
DELETE /api/notifications/read               // حذف جميع المقروءة
POST   /api/notifications/broadcast          // إرسال لجميع المستخدمين
```

---

## Frontend Service Methods

```typescript
// Frontend: apps/frontend/src/services/notifications.service.ts

✅ getAll(filters?)                  // جلب جميع الإشعارات
✅ getUnreadCount()                  // عدد غير المقروءة
✅ markAsRead(id)                    // تعليم كمقروء
✅ markAllAsRead()                   // تعليم الكل كمقروء
✅ delete(id)                        // حذف إشعار
✅ deleteAllRead()                   // حذف جميع المقروءة
✅ create(data)                      // إنشاء إشعار (Admin)
✅ broadcastToAll(data)              // إرسال لجميع المستخدمين (Admin)
✅ getUserNotifications(userId)      // جلب إشعارات مستخدم
```

---

## أمثلة الاستخدام

### Backend - إرسال إشعار:

```typescript
// في أي service
constructor(
  private readonly notificationsService: NotificationsService,
) {}

async someMethod() {
  // ... your logic
  
  // إرسال إشعار
  await this.notificationsService.notifyResearchSubmitted(
    research.id,
    research.title,
    research.user_id
  );
}
```

### Frontend - جلب الإشعارات:

```typescript
import notificationsService from '@/services/notifications.service';

// جلب جميع الإشعارات
const notifications = await notificationsService.getAll();

// جلب غير المقروءة فقط
const unread = await notificationsService.getAll({ is_read: false });

// عدد غير المقروءة
const count = await notificationsService.getUnreadCount();

// تعليم كمقروء
await notificationsService.markAsRead(notificationId);
```

---

## Notification Types

```typescript
export enum NotificationType {
  // Research
  RESEARCH_SUBMITTED = 'research_submitted',
  RESEARCH_ACCEPTED = 'research_accepted',
  RESEARCH_REJECTED = 'research_rejected',
  RESEARCH_PUBLISHED = 'research_published',
  
  // Review
  REVIEWER_ASSIGNED = 'reviewer_assigned',
  REVIEW_SUBMITTED = 'review_submitted',
  REVISION_REQUESTED = 'revision_requested',
  REVISION_SUBMITTED = 'revision_submitted',
  
  // User
  ACCOUNT_CREATED = 'account_created',
  ACCOUNT_APPROVED = 'account_approved',
  ACCOUNT_SUSPENDED = 'account_suspended',
  PASSWORD_CHANGED = 'password_changed',
  
  // System
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  GENERAL = 'general',
}
```

---

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  research_id UUID,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## الملفات المهمة

### Backend:
```
📁 apps/backend/src/modules/notifications/
  ├── notifications.service.ts          ⭐ الدوال الرئيسية
  ├── notifications.controller.ts       ⭐ API Endpoints
  ├── notifications.module.ts
  ├── dto/
  │   ├── create-notification.dto.ts
  │   ├── update-notification.dto.ts
  │   └── broadcast-notification.dto.ts
  └── entities/
      └── notification.entity.ts

📁 apps/backend/src/modules/research/
  ├── research.service.ts               ⭐ إشعارات البحث
  └── research.module.ts

📁 apps/backend/src/modules/reviews/
  ├── reviews.service.ts                ⭐ إشعارات التقييم
  └── reviews.module.ts

📁 apps/backend/src/modules/reviewer-assignments/
  ├── reviewer-assignments.service.ts   ⭐ إشعارات التعيين
  └── reviewer-assignments.module.ts

📁 apps/backend/src/modules/research-revisions/
  ├── research-revisions.service.ts     ⭐ إشعارات التعديلات
  └── research-revisions.module.ts
```

### Frontend:
```
📁 apps/frontend/src/
  ├── services/
  │   └── notifications.service.ts      ⭐ خدمة الإشعارات
  ├── pages/dashboard/
  │   └── NotificationsPage.tsx         ⭐ صفحة الإشعارات
  └── components/dashboard/
      ├── DashboardLayout.tsx            ⭐ عداد الإشعارات
      └── NotificationCard.tsx
```

---

## اختصارات سريعة

### تشغيل Backend:
```bash
cd /home/belal/Documents/my-journal
npx nx serve backend
```

### تشغيل Frontend:
```bash
cd /home/belal/Documents/my-journal
npx nx serve frontend
```

### Build Backend:
```bash
npx nx build backend
```

### Build Frontend:
```bash
npx nx build frontend
```

---

## Troubleshooting

### المشكلة: الإشعارات لا تظهر
**الحل:**
1. تحقق من أن Backend يعمل
2. تحقق من أن المستخدم مسجل دخول
3. افتح Console في المتصفح وابحث عن أخطاء
4. تحقق من أن الـ API endpoint صحيح

### المشكلة: عداد الإشعارات لا يتحدث
**الحل:**
1. تحقق من أن event `notificationsUpdated` يتم إطلاقه
2. افتح `DashboardLayout.tsx` وتحقق من الـ event listener
3. جرب تحديث الصفحة

### المشكلة: Build Error
**الحل:**
1. تأكد من تثبيت جميع الـ dependencies
2. نفذ `npm install` في المجلد الرئيسي
3. نفذ `npx nx reset` لمسح الـ cache
4. جرب البناء مرة أخرى

---

## 📞 للمزيد من المعلومات

- **التوثيق الشامل**: `NOTIFICATIONS_SYSTEM_COMPLETE.md`
- **الملخص بالعربية**: `NOTIFICATIONS_SUMMARY_AR.md`
- **حالة المشروع**: `NOTIFICATIONS_STATUS.md`

---

**✅ نظام الإشعارات مكتمل وجاهز!**
