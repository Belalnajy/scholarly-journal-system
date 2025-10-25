import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from backend/.env
const envPath = path.join(__dirname, '../../../../apps/backend/.env');
dotenv.config({ path: envPath });
console.log('📁 Loading .env from:', envPath);

async function seedDemoData() {
  // Create simple DataSource without entities
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'journal_db',
  });

  await dataSource.initialize();
  console.log('✅ Database connected');

  try {
    // 1. Delete all existing data
    console.log('🗑️  Deleting existing data...');
    await dataSource.query('DELETE FROM reviews');
    await dataSource.query('DELETE FROM reviewer_assignments');
    await dataSource.query('DELETE FROM research_revisions');
    await dataSource.query('DELETE FROM research');
    console.log('✅ All research data deleted');

    // 2. Get demo users
    const users = await dataSource.query(`
      SELECT id, email, role FROM users 
      WHERE email IN ('admin@demo.com', 'editor@demo.com', 'reviewer@demo.com', 'researcher@demo.com')
    `);

    if (users.length < 4) {
      console.log('⚠️  Creating demo users...');
      const hashedPassword = await bcrypt.hash('Demo@123', 10);
      
      const demoUsers = [
        { email: 'admin@demo.com', name: 'مدير النظام', role: 'admin' },
        { email: 'editor@demo.com', name: 'محرر المجلة', role: 'editor' },
        { email: 'reviewer@demo.com', name: 'محكم علمي', role: 'reviewer' },
        { email: 'researcher@demo.com', name: 'باحث أكاديمي', role: 'researcher' },
      ];

      for (const user of demoUsers) {
        await dataSource.query(
          `INSERT INTO users (id, email, password, name, role, status, specialization, created_at, updated_at) 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'active', 'علوم الحاسب', NOW(), NOW())
           ON CONFLICT (email) DO NOTHING`,
          [user.email, hashedPassword, user.name, user.role]
        );
      }
      console.log('✅ Demo users created');
    }

    // Refresh users list
    const allUsers = await dataSource.query(`
      SELECT id, email, role FROM users 
      WHERE email IN ('admin@demo.com', 'editor@demo.com', 'reviewer@demo.com', 'researcher@demo.com')
    `);

    const admin = allUsers.find((u: any) => u.email === 'admin@demo.com');
    const editor = allUsers.find((u: any) => u.email === 'editor@demo.com');
    const reviewer = allUsers.find((u: any) => u.email === 'reviewer@demo.com');
    const researcher = allUsers.find((u: any) => u.email === 'researcher@demo.com');

    if (!admin || !editor || !reviewer || !researcher) {
      throw new Error('Demo users not found!');
    }

    console.log('✅ Demo users found:', {
      admin: admin.email,
      editor: editor.email,
      reviewer: reviewer.email,
      researcher: researcher.email,
    });

    // 3. Create 20 research papers with different statuses
    console.log('📝 Creating 20 research papers...');

    const statuses = [
      'under-review',      // 5 papers
      'pending-editor-decision', // 5 papers
      'needs-revision',    // 3 papers
      'accepted',          // 4 papers
      'rejected',          // 2 papers
      'published',         // 1 paper
    ];

    const titles = [
      'تطبيقات الذكاء الاصطناعي في التعليم',
      'تحليل البيانات الضخمة في الرعاية الصحية',
      'أمن المعلومات في الحوسبة السحابية',
      'تقنيات التعلم العميق في معالجة الصور',
      'إنترنت الأشياء وتطبيقاته الصناعية',
      'تطوير تطبيقات الهواتف الذكية',
      'الواقع الافتراضي في التدريب المهني',
      'تحليل الشبكات الاجتماعية',
      'الحوسبة الكمومية ومستقبل التشفير',
      'تطبيقات البلوك تشين في القطاع المالي',
      'الروبوتات الذكية في الصناعة',
      'معالجة اللغات الطبيعية باللغة العربية',
      'أنظمة التوصية الذكية',
      'الأمن السيبراني في المؤسسات',
      'تطبيقات التعلم الآلي في الطب',
      'تحليل سلوك المستخدم على الإنترنت',
      'تقنيات الواقع المعزز في التعليم',
      'إدارة قواعد البيانات الموزعة',
      'تطوير الألعاب الإلكترونية',
      'الحوسبة الضبابية وتطبيقاتها',
    ];

    const specializations = [
      'علوم الحاسب',
      'هندسة البرمجيات',
      'أمن المعلومات',
      'الذكاء الاصطناعي',
      'علوم البيانات',
    ];

    let researchIndex = 0;
    const createdResearch: any[] = [];

    for (const status of statuses) {
      const count = 
        status === 'under-review' ? 5 :
        status === 'pending-editor-decision' ? 5 :
        status === 'needs-revision' ? 3 :
        status === 'accepted' ? 4 :
        status === 'rejected' ? 2 : 1;

      for (let i = 0; i < count && researchIndex < 20; i++) {
        const title = titles[researchIndex];
        const researchNumber = `RES-2025-${String(researchIndex + 1).padStart(4, '0')}`;
        const specialization = specializations[researchIndex % specializations.length];

        const result = await dataSource.query(
          `INSERT INTO research (
            id, user_id, research_number, title, abstract, specialization, 
            status, submission_date, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW()
          ) RETURNING id`,
          [
            researcher.id,
            researchNumber,
            title,
            `ملخص البحث: ${title}. يتناول هذا البحث موضوعاً مهماً في مجال ${specialization} ويقدم حلولاً مبتكرة.`,
            specialization,
            status,
          ]
        );

        createdResearch.push({
          id: result[0].id,
          status,
          researchNumber,
        });

        researchIndex++;
      }
    }

    console.log(`✅ Created ${createdResearch.length} research papers`);

    // 4. Assign reviewers and create reviews for appropriate statuses
    console.log('👥 Assigning reviewers and creating reviews...');

    for (const research of createdResearch) {
      if (['under-review', 'pending-editor-decision', 'needs-revision', 'accepted', 'rejected'].includes(research.status)) {
        // Assign reviewer
        await dataSource.query(
          `INSERT INTO reviewer_assignments (
            id, research_id, reviewer_id, assigned_by, deadline, status, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, NOW() + INTERVAL '30 days', $4, NOW(), NOW()
          )`,
          [
            research.id,
            reviewer.id,
            editor.id,
            research.status === 'under-review' ? 'accepted' : 'completed',
          ]
        );

        // Create review if needed
        if (['pending-editor-decision', 'needs-revision', 'accepted', 'rejected'].includes(research.status)) {
          const recommendation = 
            research.status === 'needs-revision' ? 'needs-revision' :
            research.status === 'rejected' ? 'rejected' : 'accepted';

          await dataSource.query(
            `INSERT INTO reviews (
              id, research_id, reviewer_id, criteria_ratings, general_comments, 
              recommendation, average_rating, status, submitted_at, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, 'completed', NOW(), NOW(), NOW()
            )`,
            [
              research.id,
              reviewer.id,
              JSON.stringify({
                'وضوح العنوان': 4,
                'جودة المنهجية': 4,
                'أصالة الفكرة': 3,
                'سلامة اللغة': 5,
                'المراجع المستخدمة': 4,
                'جودة العرض العام': 4,
              }),
              `تقييم البحث: ${research.researchNumber}. البحث جيد بشكل عام ويحتاج إلى بعض التحسينات.`,
              recommendation,
              4.0,
            ]
          );
        }
      }
    }

    console.log('✅ Reviewers assigned and reviews created');

    // 5. Summary
    console.log('\n📊 Summary:');
    const summary = await dataSource.query(`
      SELECT status, COUNT(*) as count 
      FROM research 
      GROUP BY status 
      ORDER BY status
    `);
    
    console.table(summary);

    console.log('\n✅ Demo data seeded successfully!');
    console.log('\n👤 Demo Accounts:');
    console.log('   Admin:      admin@demo.com / Demo@123');
    console.log('   Editor:     editor@demo.com / Demo@123');
    console.log('   Reviewer:   reviewer@demo.com / Demo@123');
    console.log('   Researcher: researcher@demo.com / Demo@123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

// Run the script
seedDemoData()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
