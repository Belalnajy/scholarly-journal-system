import { DataSource } from 'typeorm';
import { Issue } from '../database/entities/issue.entity';

async function seedIssues() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'my_journal',
    entities: [Issue],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const issueRepository = dataSource.getRepository(Issue);

    // Check if issues already exist
    const existingIssues = await issueRepository.count();
    if (existingIssues > 0) {
      console.log(`ℹ️  ${existingIssues} issues already exist. Skipping seed.`);
      await dataSource.destroy();
      return;
    }

    // Create sample issues
    const issues = [
      {
        issue_number: 'العدد 1',
        title: 'العدد الأول - يناير 2024',
        description: 'العدد الافتتاحي للمجلة العلمية',
        publish_date: new Date('2024-01-15'),
        max_articles: 12,
        status: 'published' as const,
      },
      {
        issue_number: 'العدد 2',
        title: 'العدد الثاني - فبراير 2024',
        description: 'عدد خاص بالذكاء الاصطناعي والتعليم',
        publish_date: new Date('2024-02-15'),
        max_articles: 15,
        status: 'published' as const,
      },
      {
        issue_number: 'العدد 3',
        title: 'العدد الثالث - مارس 2024',
        description: 'عدد خاص بالتنمية المستدامة',
        publish_date: new Date('2024-03-15'),
        max_articles: 10,
        status: 'in-progress' as const,
      },
      {
        issue_number: 'العدد 4',
        title: 'العدد الرابع - أبريل 2024',
        description: 'عدد خاص بالأمن السيبراني',
        publish_date: new Date('2024-04-15'),
        max_articles: 12,
        status: 'planned' as const,
      },
      {
        issue_number: 'العدد 5',
        title: 'العدد الخامس - مايو 2024',
        description: 'عدد خاص بالطاقة المتجددة',
        publish_date: new Date('2024-05-15'),
        max_articles: 14,
        status: 'planned' as const,
      },
    ];

    for (const issueData of issues) {
      const issue = issueRepository.create(issueData);
      await issueRepository.save(issue);
      console.log(`✅ Created issue: ${issue.title}`);
    }

    console.log('\n🎉 Successfully seeded issues!');
    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding issues:', error);
    process.exit(1);
  }
}

seedIssues();
