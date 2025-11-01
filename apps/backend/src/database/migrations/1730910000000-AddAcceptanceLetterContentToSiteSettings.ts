import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAcceptanceLetterContentToSiteSettings1730910000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add acceptance_letter_content column
    await queryRunner.addColumn(
      'site_settings',
      new TableColumn({
        name: 'acceptance_letter_content',
        type: 'text',
        isNullable: true,
      })
    );

    // Set default content for existing records
    const defaultContent = `قد تم قبوله للنشر في مجلتنا بعد مراجعته من قبل المحكمين المختصين واستيفائه لجميع المعايير العلمية والأكاديمية المطلوبة.

نتقدم لكم بأحر التهاني على هذا الإنجاز العلمي المتميز، ونتطلع إلى المزيد من التعاون العلمي المثمر معكم.

وتفضلوا بقبول فائق الاحترام والتقدير،`;

    await queryRunner.query(
      `UPDATE site_settings SET acceptance_letter_content = $1 WHERE acceptance_letter_content IS NULL`,
      [defaultContent]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove acceptance_letter_content column
    await queryRunner.dropColumn('site_settings', 'acceptance_letter_content');
  }
}
