# 📧 إعداد البريد الإلكتروني - Gmail SMTP

## خطوة واحدة فقط! ⚡

### أضف هذه الأسطر في ملف `.env`

**المسار:** `/apps/backend/.env`

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=journalresearchut@gmail.com
EMAIL_PASSWORD=vxgd udzy okjp rrjb
```

---

## ✅ ذلك كل شيء!

بعد إضافة المتغيرات، شغل الـ Backend:

```bash
nx serve backend
```

وشغل الـ Frontend:

```bash
nx serve frontend
```

---

## 🧪 اختبر النظام

1. افتح المتصفح: `http://localhost:4200`
2. اذهب لصفحة تسجيل الدخول
3. اضغط "نسيت كلمة المرور؟"
4. أدخل بريد إلكتروني: `admin@demo.com`
5. ستصلك رسالة على البريد مع رمز التحقق (6 أرقام)
6. أدخل الرمز
7. غير كلمة المرور
8. سجل الدخول بكلمة المرور الجديدة ✅

---

## 📝 ملاحظات

- **Gmail App Password** صالح ونشط
- الرموز تنتهي بعد **15 دقيقة**
- كل رمز يُستخدم **مرة واحدة** فقط
- يتم إرسال **بريد تأكيد** بعد تغيير كلمة المرور

---

## 🎯 الحسابات التجريبية

يمكنك اختبار النظام مع أي من الحسابات التالية:

- `admin@demo.com`
- `editor@demo.com`
- `reviewer@demo.com`
- `researcher@demo.com`

---

## 🚀 جاهز للاستخدام!
