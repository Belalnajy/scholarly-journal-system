# إعادة توليد جميع شهادات القبول

## المشكلة
الشهادات القديمة تستخدم روابط `authenticated` غير صحيحة.

## الحل السريع (مؤقت)
تم إضافة كود في Frontend لتحويل الروابط القديمة تلقائياً.

## الحل النهائي
إعادة توليد جميع الشهادات من Backend.

## طريقة 1: من Console المتصفح (للمحرر/الأدمن)

### الخطوات:
1. **افتح صفحة "إدارة الأبحاث"**
2. **افتح Console** (F12 → Console)
3. **انسخ والصق هذا الكود:**

```javascript
// Script لإعادة توليد جميع الشهادات
async function regenerateAllCertificates() {
  console.log('🚀 بدء إعادة توليد الشهادات...');
  
  try {
    // جلب جميع الأبحاث المقبولة
    const response = await fetch('/api/research?status=accepted', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const researches = await response.json();
    console.log(`📊 وجدنا ${researches.length} بحث مقبول`);
    
    let success = 0;
    let failed = 0;
    
    for (const research of researches) {
      // تحقق إذا كان البحث يحتوي على شهادة
      if (research.acceptance_certificate_cloudinary_public_id) {
        try {
          console.log(`🔄 إعادة توليد شهادة: ${research.research_number}`);
          
          const regenerateResponse = await fetch(
            `/api/research/${research.id}/regenerate-acceptance-certificate`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (regenerateResponse.ok) {
            console.log(`✅ نجح: ${research.research_number}`);
            success++;
          } else {
            console.error(`❌ فشل: ${research.research_number}`);
            failed++;
          }
          
          // انتظر ثانية واحدة بين كل طلب
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ خطأ في ${research.research_number}:`, error);
          failed++;
        }
      } else {
        console.log(`⏭️ تخطي ${research.research_number} (لا توجد شهادة)`);
      }
    }
    
    console.log('\n📈 النتائج:');
    console.log(`✅ نجح: ${success}`);
    console.log(`❌ فشل: ${failed}`);
    console.log('✨ انتهى!');
    
  } catch (error) {
    console.error('❌ خطأ عام:', error);
  }
}

// تشغيل
regenerateAllCertificates();
```

4. **انتظر حتى ينتهي** (قد يستغرق دقائق حسب عدد الأبحاث)
5. **حدّث الصفحة**

## طريقة 2: من Backend (للمطورين)

### إنشاء Script:
```bash
# إنشاء ملف جديد
touch apps/backend/src/scripts/regenerate-certificates.ts
```

### محتوى الملف:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ResearchService } from '../modules/research/research.service';

async function regenerateAllCertificates() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const researchService = app.get(ResearchService);

  console.log('🚀 بدء إعادة توليد الشهادات...');

  try {
    // جلب جميع الأبحاث المقبولة
    const researches = await researchService.getAll({ status: 'accepted' });
    console.log(`📊 وجدنا ${researches.length} بحث مقبول`);

    let success = 0;
    let failed = 0;

    for (const research of researches) {
      if (research.acceptance_certificate_cloudinary_public_id) {
        try {
          console.log(`🔄 إعادة توليد: ${research.research_number}`);
          await researchService.regenerateAcceptanceCertificate(research.id);
          console.log(`✅ نجح: ${research.research_number}`);
          success++;
        } catch (error) {
          console.error(`❌ فشل: ${research.research_number}`, error.message);
          failed++;
        }
      }
    }

    console.log('\n📈 النتائج:');
    console.log(`✅ نجح: ${success}`);
    console.log(`❌ فشل: ${failed}`);

  } catch (error) {
    console.error('❌ خطأ عام:', error);
  } finally {
    await app.close();
  }
}

regenerateAllCertificates();
```

### تشغيل الScript:
```bash
NODE_OPTIONS='--import tsx' node apps/backend/src/scripts/regenerate-certificates.ts
```

## طريقة 3: يدوياً (لعدد قليل من الأبحاث)

### من صفحة "إدارة الأبحاث":
1. فلتر الأبحاث المقبولة
2. اضغط على زر 🏆 لكل بحث
3. انتظر "تم توليد الشهادة بنجاح"
4. كرر للأبحاث الأخرى

## التحقق من النجاح

بعد إعادة التوليد، تحقق من:

### 1. الرابط الجديد
```javascript
// من Console
const research = await fetch('/api/research/RESEARCH_ID').then(r => r.json());
console.log(research.acceptance_certificate_cloudinary_secure_url);
// يجب أن يكون: https://res.cloudinary.com/.../upload/v1/certificates/...
// وليس: https://res.cloudinary.com/.../authenticated/...
```

### 2. التحميل
- اذهب لصفحة البحث
- اضغط "تحميل الشهادة"
- يجب أن يُحمل الملف بنجاح

## الأسئلة الشائعة

### س: كم يستغرق إعادة توليد شهادة واحدة؟
**ج:** حوالي 2-3 ثواني (توليد PDF + رفع على Cloudinary)

### س: هل سيتم حذف الشهادات القديمة؟
**ج:** نعم، تلقائياً من Cloudinary

### س: هل يمكن إعادة التوليد أثناء استخدام النظام؟
**ج:** نعم، لكن يُفضل في وقت هادئ

### س: ماذا لو فشل بعض الأبحاث؟
**ج:** يمكنك إعادة المحاولة لها يدوياً

## ملاحظات مهمة

- ⚠️ تأكد من إعادة تشغيل Backend قبل إعادة التوليد
- ⚠️ احتفظ بنسخة احتياطية من قاعدة البيانات
- ⚠️ راقب استهلاك Cloudinary (الحصة المجانية)
- ✅ الأبحاث الجديدة ستعمل تلقائياً بدون مشاكل

## الدعم
للمساعدة أو الإبلاغ عن مشاكل، تواصل مع فريق التطوير.
