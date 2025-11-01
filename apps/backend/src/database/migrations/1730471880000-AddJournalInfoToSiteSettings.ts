import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddJournalInfoToSiteSettings1730471880000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add journal DOI column
    await queryRunner.addColumn(
      'site_settings',
      new TableColumn({
        name: 'journal_doi',
        type: 'text',
        isNullable: true,
      })
    );

    // Add journal URL column
    await queryRunner.addColumn(
      'site_settings',
      new TableColumn({
        name: 'journal_url',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove journal URL column
    await queryRunner.dropColumn('site_settings', 'journal_url');
    
    // Remove journal DOI column
    await queryRunner.dropColumn('site_settings', 'journal_doi');
  }
}
