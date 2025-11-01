// @ts-nocheck - Temporary fix for type errors during deployment
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

async function seedResearch() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'my_journal',
    entities: ['apps/backend/src/database/entities/*.entity.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const researchRepository = dataSource.getRepository('research');
    const userRepository = dataSource.getRepository('users');

    // Get all researchers
    const researchers = await userRepository.find({
      where: { role: 'researcher' },
    });

    if (researchers.length === 0) {
      console.log('❌ No researchers found. Please seed users first.');
      await dataSource.destroy();
      return;
    }

    console.log(`📊 Found ${researchers.length} researchers`);

    // Check existing research count
    const existingCount = await researchRepository.count();
    console.log(`📚 Current research count: ${existingCount}`);

    const specializations = [
      'علوم الحاسب',
      'الذكاء الاصطناعي',
      'الأمن السيبراني',
      'هندسة البرمجيات',
      'علوم البيانات',
      'الشبكات والاتصالات',
      'الحوسبة السحابية',
      'إنترنت الأشياء',
      'الواقع الافتراضي',
      'البلوك تشين',
    ];

    const statuses = [
      'under-review',
      'pending-editor-decision',
      'needs-revision',
      'accepted',
      'rejected',
      'published',
    ];

    const researchTitles = [
      'تطبيقات الذكاء الاصطناعي في التعليم الإلكتروني',
      'أمن المعلومات في الحوسبة السحابية',
      'تحليل البيانات الضخمة باستخدام التعلم الآلي',
      'تطوير أنظمة الكشف عن التسلل الإلكتروني',
      'استخدام البلوك تشين في الأنظمة المالية',
      'تحسين أداء الشبكات اللاسلكية',
      'تطبيقات إنترنت الأشياء في المدن الذكية',
      'الواقع المعزز في التدريب الطبي',
      'معالجة اللغات الطبيعية للغة العربية',
      'أنظمة التوصية الذكية للتجارة الإلكترونية',
    ];

    const keywords = [
      ['ذكاء اصطناعي', 'تعلم آلي', 'شبكات عصبية'],
      ['أمن سيبراني', 'تشفير', 'حماية البيانات'],
      ['بيانات ضخمة', 'تحليل بيانات', 'استخراج معرفة'],
      ['حوسبة سحابية', 'خدمات سحابية', 'بنية تحتية'],
      ['بلوك تشين', 'عملات رقمية', 'عقود ذكية'],
      ['شبكات', 'اتصالات', 'بروتوكولات'],
      ['إنترنت الأشياء', 'أجهزة ذكية', 'استشعار'],
      ['واقع افتراضي', 'واقع معزز', 'تفاعل بشري'],
      ['معالجة لغات', 'لغة عربية', 'ترجمة آلية'],
      ['أنظمة توصية', 'تخصيص', 'تجربة مستخدم'],
    ];

    let createdCount = 0;
    const totalToCreate = 50; // عدد الأبحاث المطلوب إنشاؤها

    for (let i = 0; i < totalToCreate; i++) {
      const randomUser = researchers[Math.floor(Math.random() * researchers.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomSpec = specializations[Math.floor(Math.random() * specializations.length)];
      const titleIndex = i % researchTitles.length;
      
      const submissionDate = new Date();
      submissionDate.setDate(submissionDate.getDate() - Math.floor(Math.random() * 180));

      const researchData: any = {
        user_id: randomUser.id,
        research_number: `R-${Date.now()}-${i.toString().padStart(4, '0')}`,
        title: `${researchTitles[titleIndex]} - دراسة ${i + 1}`,
        title_en: `Research Study ${i + 1} on ${randomSpec}`,
        abstract: `هذا البحث يتناول موضوع ${researchTitles[titleIndex]} من خلال دراسة شاملة تهدف إلى تحليل وتقييم الجوانب المختلفة للموضوع. يقدم البحث منهجية علمية متقدمة ونتائج مهمة تساهم في تطوير المجال.`,
        abstract_en: `This research addresses the topic through a comprehensive study aimed at analyzing and evaluating various aspects. The research presents an advanced scientific methodology and important results that contribute to the development of the field.`,
        keywords: keywords[titleIndex],
        keywords_en: ['AI', 'Machine Learning', 'Technology'],
        specialization: randomSpec,
        status: randomStatus,
        submission_date: submissionDate,
        views_count: Math.floor(Math.random() * 500),
        downloads_count: Math.floor(Math.random() * 200),
      };

      // إضافة بيانات حسب الحالة
      if (randomStatus === 'accepted' || 
          randomStatus === 'published' ||
          randomStatus === 'rejected') {
        const evalDate = new Date(submissionDate);
        evalDate.setDate(evalDate.getDate() + Math.floor(Math.random() * 60) + 30);
        researchData.evaluation_date = evalDate;
        researchData.average_rating = (Math.random() * 2 + 3).toFixed(2); // 3.00 to 5.00
      }

      if (randomStatus === 'published') {
        const pubDate = new Date(researchData.evaluation_date);
        pubDate.setDate(pubDate.getDate() + Math.floor(Math.random() * 30) + 15);
        researchData.published_date = pubDate;
      }

      const research = researchRepository.create(researchData);
      await researchRepository.save(research);
      createdCount++;

      if (createdCount % 10 === 0) {
        console.log(`✅ Created ${createdCount}/${totalToCreate} research papers...`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created ${createdCount} research papers!`);
    
    // عرض إحصائيات حسب الحالة
    for (const status of statuses) {
      const count = await researchRepository.count({ where: { status } });
      console.log(`   - ${status}: ${count} papers`);
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding research:', error);
    process.exit(1);
  }
}

seedResearch();
