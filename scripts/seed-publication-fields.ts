/**
 * Seed script for Publication Fields
 * Run: npx ts-node scripts/seed-publication-fields.ts
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './apps/backend/.env' });

const publicationFields = [
  {
    name_ar: 'علوم الحاسب وتقنية المعلومات',
    name_en: 'Computer Science and Information Technology',
    description_ar: 'أبحاث في مجالات البرمجة، الذكاء الاصطناعي، أمن المعلومات، وقواعد البيانات',
    description_en: 'Research in programming, AI, cybersecurity, and databases',
    display_order: 1,
    is_active: true,
  },
  {
    name_ar: 'الهندسة',
    name_en: 'Engineering',
    description_ar: 'أبحاث في الهندسة المدنية، الكهربائية، الميكانيكية، والصناعية',
    description_en: 'Research in civil, electrical, mechanical, and industrial engineering',
    display_order: 2,
    is_active: true,
  },
  {
    name_ar: 'الطب والعلوم الصحية',
    name_en: 'Medicine and Health Sciences',
    description_ar: 'أبحاث طبية وصحية في مختلف التخصصات',
    description_en: 'Medical and health research in various specializations',
    display_order: 3,
    is_active: true,
  },
  {
    name_ar: 'العلوم الطبيعية',
    name_en: 'Natural Sciences',
    description_ar: 'أبحاث في الفيزياء، الكيمياء، الأحياء، والرياضيات',
    description_en: 'Research in physics, chemistry, biology, and mathematics',
    display_order: 4,
    is_active: true,
  },
  {
    name_ar: 'العلوم الإنسانية',
    name_en: 'Humanities',
    description_ar: 'أبحاث في التاريخ، الأدب، الفلسفة، واللغات',
    description_en: 'Research in history, literature, philosophy, and languages',
    display_order: 5,
    is_active: true,
  },
  {
    name_ar: 'العلوم الاجتماعية',
    name_en: 'Social Sciences',
    description_ar: 'أبحاث في علم الاجتماع، علم النفس، والخدمة الاجتماعية',
    description_en: 'Research in sociology, psychology, and social work',
    display_order: 6,
    is_active: true,
  },
  {
    name_ar: 'إدارة الأعمال والاقتصاد',
    name_en: 'Business and Economics',
    description_ar: 'أبحاث في الإدارة، التسويق، المحاسبة، والاقتصاد',
    description_en: 'Research in management, marketing, accounting, and economics',
    display_order: 7,
    is_active: true,
  },
  {
    name_ar: 'التربية وعلم النفس التربوي',
    name_en: 'Education and Educational Psychology',
    description_ar: 'أبحاث في طرق التدريس، المناهج، والتقويم التربوي',
    description_en: 'Research in teaching methods, curricula, and educational assessment',
    display_order: 8,
    is_active: true,
  },
  {
    name_ar: 'القانون والشريعة',
    name_en: 'Law and Sharia',
    description_ar: 'أبحاث قانونية وشرعية',
    description_en: 'Legal and Sharia research',
    display_order: 9,
    is_active: true,
  },
  {
    name_ar: 'الإعلام والاتصال',
    name_en: 'Media and Communication',
    description_ar: 'أبحاث في الصحافة، الإذاعة، التلفزيون، والإعلام الرقمي',
    description_en: 'Research in journalism, radio, television, and digital media',
    display_order: 10,
    is_active: true,
  },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'journal_db',
    entities: ['apps/backend/src/database/entities/**/*.entity.ts'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    // Check if publication_fields table exists
    const tableExists = await queryRunner.hasTable('publication_fields');
    if (!tableExists) {
      console.log('❌ Table publication_fields does not exist. Run migrations first.');
      await queryRunner.release();
      await dataSource.destroy();
      return;
    }

    // Clear existing data (optional)
    const shouldClear = process.argv.includes('--clear');
    if (shouldClear) {
      await queryRunner.query('DELETE FROM publication_fields');
      console.log('🗑️  Cleared existing publication fields');
    }

    // Insert publication fields
    for (const field of publicationFields) {
      await queryRunner.query(
        `INSERT INTO publication_fields (name_ar, name_en, description_ar, description_en, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          field.name_ar,
          field.name_en,
          field.description_ar,
          field.description_en,
          field.display_order,
          field.is_active,
        ]
      );
    }

    console.log(`✅ Seeded ${publicationFields.length} publication fields`);

    await queryRunner.release();
    await dataSource.destroy();
    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
