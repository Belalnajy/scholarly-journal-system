# دليل نظام الدفع - Payment System Guide

## نظرة عامة
تم إضافة نظام دفع كامل لرسوم تقديم الأبحاث. يتطلب من الباحثين دفع رسوم قبل تقديم أبحاثهم.

## المكونات الرئيسية

### 1. Backend Changes

#### Database Schema
تم إضافة الحقول التالية:

**جدول Users:**
```sql
ALTER TABLE users ADD COLUMN payment_status ENUM('pending', 'paid', 'verified') DEFAULT 'pending';
ALTER TABLE users ADD COLUMN payment_verified_at TIMESTAMP NULL;
```

**جدول Site Settings:**
```sql
ALTER TABLE site_settings ADD COLUMN submission_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE site_settings ADD COLUMN submission_fee_currency VARCHAR(255);
ALTER TABLE site_settings ADD COLUMN payment_instructions TEXT;
```

#### API Endpoints

**1. الحصول على حالة الدفع**
```
GET /api/users/:id/payment-status
```
Response:
```json
{
  "payment_status": "pending|paid|verified",
  "payment_verified_at": "2025-10-29T00:00:00.000Z",
  "can_submit_research": false
}
```

**2. تأكيد الدفع (Admin/Editor فقط)**
```
PATCH /api/users/:id/verify-payment
```

**3. قائمة الدفعات المعلقة (Admin/Editor فقط)**
```
GET /api/users/pending-payments/list
```

### 2. Frontend Changes

#### صفحات جديدة

**1. PaymentInstructionsPage** (`/dashboard/payment-instructions`)
- عرض تعليمات الدفع
- عرض قيمة الرسوم والعملة
- زر للتواصل عبر الواتساب
- زر "لقد قمت بالدفع" لتحديث الحالة

**2. ManagePaymentsPage** (`/dashboard/manage-payments`)
- قائمة الباحثين الذين قاموا بالدفع
- زر تأكيد الدفع لكل باحث
- إرسال إشعار تلقائي عند التأكيد

#### تحديثات على الصفحات الموجودة

**1. SiteSettingsPage**
- قسم جديد لإدارة رسوم التقديم
- حقل قيمة الرسوم
- حقل العملة
- حقل تعليمات الدفع

**2. ResearcherDashboard**
- بطاقة تنبيه إذا لم يتم الدفع
- زر للذهاب لصفحة الدفع

**3. SubmitResearchPage**
- التحقق من حالة الدفع قبل السماح بالتقديم
- إعادة توجيه تلقائية لصفحة الدفع إذا لم يتم التأكيد

## سير العمل (Workflow)

### للباحث:
1. تسجيل الدخول للنظام
2. محاولة تقديم بحث
3. يتم توجيهه لصفحة تعليمات الدفع
4. قراءة التعليمات والتواصل عبر الواتساب
5. إتمام الدفع
6. الضغط على "لقد قمت بالدفع"
7. انتظار موافقة الإدارة
8. بعد الموافقة، يمكنه تقديم البحث

### للأدمن/المحرر:
1. الدخول لصفحة "إدارة الدفعات"
2. مراجعة قائمة الدفعات المعلقة
3. التحقق من الدفع (خارج النظام)
4. الضغط على "تأكيد الدفع"
5. يتم إرسال إشعار تلقائي للباحث
6. يصبح الباحث قادراً على تقديم الأبحاث

## حالات الدفع (Payment Status)

- **pending**: لم يقم الباحث بالدفع بعد
- **paid**: قام الباحث بالدفع وينتظر موافقة الإدارة
- **verified**: تم تأكيد الدفع من قبل الإدارة

## الإعدادات

### تفعيل/تعطيل نظام الدفع
- من صفحة إعدادات الموقع
- اضبط قيمة الرسوم على `0` لتعطيل النظام
- اضبط قيمة أكبر من `0` لتفعيل النظام

### تعليمات الدفع
يمكن إضافة تعليمات مفصلة تشمل:
- رقم الحساب البنكي
- رقم الواتساب للتواصل
- طريقة إرسال إثبات الدفع
- أي ملاحظات إضافية

## الإشعارات

يتم إرسال إشعار تلقائي للباحث في الحالات التالية:
- عند تأكيد الدفع من قبل الإدارة

## الأمان

- جميع endpoints محمية بـ JWT Authentication
- فقط Admin و Editor يمكنهم تأكيد الدفعات
- فقط Admin يمكنه تعديل إعدادات الرسوم

## Migration للقاعدة البيانات

إذا كنت تستخدم TypeORM مع `synchronize: true`، سيتم إنشاء الأعمدة تلقائياً.

إذا كنت تريد تشغيل migration يدوياً:

```sql
-- Add payment fields to users table
ALTER TABLE users 
ADD COLUMN payment_status ENUM('pending', 'paid', 'verified') DEFAULT 'pending',
ADD COLUMN payment_verified_at TIMESTAMP NULL;

-- Add submission fee fields to site_settings table
ALTER TABLE site_settings 
ADD COLUMN submission_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN submission_fee_currency VARCHAR(255) DEFAULT 'ريال سعودي',
ADD COLUMN payment_instructions TEXT;

-- Update existing users to have pending status
UPDATE users SET payment_status = 'pending' WHERE payment_status IS NULL;
```

## ملاحظات مهمة

1. **للتطوير**: يمكن تعطيل نظام الدفع بوضع الرسوم = 0
2. **للإنتاج**: تأكد من إضافة رقم واتساب صحيح في إعدادات الموقع
3. **الإشعارات**: تأكد من أن نظام الإشعارات يعمل بشكل صحيح
4. **النسخ الاحتياطي**: احفظ نسخة احتياطية من قاعدة البيانات قبل تطبيق التغييرات

## الدعم

في حالة وجود أي مشاكل:
1. تحقق من console logs في المتصفح
2. تحقق من backend logs
3. تأكد من أن جميع الـ endpoints تعمل بشكل صحيح
4. تأكد من أن الـ JWT tokens صالحة

---

تم إنشاء هذا النظام في: 2025-10-29
