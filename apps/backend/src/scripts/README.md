# Scripts للبيانات التجريبية

هذا المجلد يحتوي على scripts لإضافة بيانات تجريبية للنظام.

## ⚙️ الإعداد الأولي

قبل تشغيل أي script، تأكد من:

1. **إنشاء ملف `.env`** في المجلد الرئيسي للمشروع:
   ```bash
   cp .env.example .env
   ```

2. **تعديل بيانات قاعدة البيانات** في ملف `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=my_journal
   ```

3. **تشغيل قاعدة البيانات** (PostgreSQL)

## 📋 Scripts المتاحة

### 1. seed-research.ts
يضيف أبحاث بجميع الحالات المختلفة

**المميزات:**
- ✅ يضيف 50 بحث بشكل افتراضي
- ✅ يوزع الأبحاث على جميع الحالات (under-review, pending-editor-decision, needs-revision, accepted, rejected, published)
- ✅ يربط الأبحاث بالباحثين الموجودين في النظام
- ✅ يضيف بيانات واقعية (تواريخ، تقييمات، مشاهدات، تحميلات)
- ✅ يعرض إحصائيات مفصلة بعد الإضافة

**الاستخدام:**
```bash
npm run seed:research
```

**ملاحظات:**
- يجب أن يكون هناك مستخدمين بدور "researcher" في النظام أولاً
- إذا لم يكن هناك باحثين، قم بتشغيل `npm run seed:demo` أولاً
- تأكد من وجود ملف `.env` في المجلد الرئيسي يحتوي على بيانات الاتصال بقاعدة البيانات:
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=postgres
  DB_PASSWORD=your_password
  DB_NAME=my_journal
  ```

### 2. seed-issues.ts
يضيف أعداد المجلة

**الاستخدام:**
```bash
npm run seed:issues
```

### 3. seed-demo-data.ts
يضيف جميع البيانات التجريبية (مستخدمين، أعداد، إلخ)

**الاستخدام:**
```bash
npm run seed:demo
```

## 🚀 الترتيب الموصى به

1. أولاً: `npm run seed:demo` - لإضافة المستخدمين والبيانات الأساسية
2. ثانياً: `npm run seed:issues` - لإضافة أعداد المجلة
3. ثالثاً: `npm run seed:research` - لإضافة الأبحاث

## 🔧 تخصيص عدد الأبحاث

لتغيير عدد الأبحاث المضافة، عدل المتغير `totalToCreate` في ملف `seed-research.ts`:

```typescript
const totalToCreate = 50; // غير هذا الرقم حسب حاجتك
```

## 📊 حالات الأبحاث

- **under-review**: البحث قيد المراجعة
- **pending-editor-decision**: في انتظار قرار المحرر
- **needs-revision**: يحتاج إلى تعديلات
- **accepted**: مقبول للنشر
- **rejected**: مرفوض
- **published**: منشور

## 🎯 التخصصات المتاحة

- علوم الحاسب
- الذكاء الاصطناعي
- الأمن السيبراني
- هندسة البرمجيات
- علوم البيانات
- الشبكات والاتصالات
- الحوسبة السحابية
- إنترنت الأشياء
- الواقع الافتراضي
- البلوك تشين
