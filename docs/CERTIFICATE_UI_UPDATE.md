# تحديث واجهة شهادة القبول

## التحديثات الجديدة

### 1. صفحة قائمة الأبحاث (MyResearchPage)

تم إضافة إمكانية تحميل شهادة القبول مباشرة من صفحة قائمة الأبحاث:

#### المميزات:
- **زر تحميل سريع**: أيقونة جائزة (Award) باللون الأخضر
- **Tooltip**: عند التمرير على الزر يظهر "تحميل الشهادة"
- **Badge مرئي**: أيقونة صغيرة بجانب حالة البحث تشير لتوفر الشهادة
- **يظهر فقط**: للأبحاث المقبولة أو المنشورة التي تم توليد شهادة لها

#### الشكل النهائي:
```
+------------------+----------+---------------+
| عنوان البحث      | الحالة   | الإجراءات     |
+------------------+----------+---------------+
| بحث مثال         | مقبول 🏆 | 🏆 👁️         |
+------------------+----------+---------------+
```

### 2. صفحة عرض البحث (ViewResearchPage)

تم تحسين قسم شهادة القبول:

#### المميزات:
- **قسم مخصص**: بتصميم أخضر جذاب
- **معلومات واضحة**: عنوان، رقم البحث، تاريخ القبول
- **زر تحميل كبير**: واضح وسهل الاستخدام
- **رسالة تهنئة**: "تهانينا! تم قبول بحثك للنشر"

## الاستخدام

### للباحث:

#### من صفحة قائمة الأبحاث:
1. اذهب إلى "أبحاثي"
2. ابحث عن البحث المقبول (سترى أيقونة 🏆 بجانب الحالة)
3. اضغط على أيقونة الجائزة الخضراء في عمود "الإجراءات"
4. ستُحمل الشهادة تلقائياً

#### من صفحة عرض البحث:
1. اضغط على "عرض التفاصيل" لأي بحث مقبول
2. انزل إلى قسم "شهادة قبول البحث"
3. اضغط على "تحميل الشهادة"

## الكود

### MyResearchPage.tsx

```typescript
// زر تحميل الشهادة
{(research.status === 'accepted' || research.status === 'published') &&
 research.acceptance_certificate_cloudinary_public_id && (
  <button
    onClick={() => handleDownloadCertificate(research)}
    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
    title="تحميل شهادة القبول"
  >
    <Award className="w-5 h-5" />
    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      تحميل الشهادة
    </span>
  </button>
)}

// Badge بجانب الحالة
{(research.status === 'accepted' || research.status === 'published') &&
 research.acceptance_certificate_cloudinary_public_id && (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200" title="شهادة القبول متاحة">
    <Award className="w-3 h-3" />
  </span>
)}
```

### دالة التحميل

```typescript
const handleDownloadCertificate = async (research: Research) => {
  try {
    toast.loading('جاري تحميل شهادة القبول...', { id: 'download-cert' });
    
    const certificateUrl = await researchService.getAcceptanceCertificateUrl(research.id);
    await downloadAcceptanceCertificate(certificateUrl, research.research_number);
    
    toast.success('تم بدء التحميل', { id: 'download-cert' });
  } catch (error) {
    toast.error('فشل تحميل الشهادة', { id: 'download-cert' });
    console.error('Error downloading certificate:', error);
  }
};
```

## التصميم

### الألوان:
- **زر التحميل**: أخضر (`text-green-600`, `hover:bg-green-50`)
- **Badge**: أخضر فاتح (`bg-green-50`, `text-green-700`, `border-green-200`)
- **قسم الشهادة**: تدرج أخضر (`from-green-50 to-emerald-100`)

### الأيقونات:
- **Award**: أيقونة الجائزة من lucide-react
- **Download**: أيقونة التحميل (في صفحة التفاصيل)

## الشروط

الشهادة تظهر فقط إذا:
1. ✅ حالة البحث = `accepted` أو `published`
2. ✅ الحقل `acceptance_certificate_cloudinary_public_id` موجود
3. ✅ المستخدم هو صاحب البحث أو من الإدارة

## الإشعارات

- **عند بدء التحميل**: "جاري تحميل شهادة القبول..."
- **عند النجاح**: "تم بدء التحميل"
- **عند الفشل**: "فشل تحميل الشهادة"

## الملفات المعدلة

1. ✅ `MyResearchPage.tsx` - إضافة زر التحميل و Badge
2. ✅ `ViewResearchPage.tsx` - قسم الشهادة المخصص
3. ✅ `researchService.ts` - دوال API
4. ✅ `downloadFile.ts` - دالة التحميل

## الاختبار

### سيناريو الاختبار:
1. قم بقبول بحث من لوحة المحرر
2. تحقق من توليد الشهادة تلقائياً
3. ادخل كباحث إلى "أبحاثي"
4. تحقق من ظهور Badge الأخضر بجانب حالة البحث
5. اضغط على أيقونة الجائزة لتحميل الشهادة
6. تحقق من تحميل الملف بنجاح

## الملاحظات

- ⚡ التحميل سريع (روابط مباشرة من Cloudinary)
- 🔒 آمن (روابط مؤقتة موقعة)
- 📱 متجاوب (يعمل على جميع الأجهزة)
- ♿ سهل الوصول (Tooltips واضحة)

## المستقبل

### تحسينات مقترحة:
- إضافة معاينة للشهادة قبل التحميل
- إمكانية طباعة الشهادة مباشرة
- إرسال الشهادة بالبريد الإلكتروني
- مشاركة الشهادة على وسائل التواصل
