import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIssnAndUniversityUrlToSiteSettings1730900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add journal ISSN column
    await queryRunner.addColumn(
      'site_settings',
      new TableColumn({
        name: 'journal_issn',
        type: 'text',
        isNullable: true,
      })
    );

    // Add university URL column
    await queryRunner.addColumn(
      'site_settings',
      new TableColumn({
        name: 'university_url',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove university URL column
    await queryRunner.dropColumn('site_settings', 'university_url');
    
    // Remove journal ISSN column
    await queryRunner.dropColumn('site_settings', 'journal_issn');
  }
}
