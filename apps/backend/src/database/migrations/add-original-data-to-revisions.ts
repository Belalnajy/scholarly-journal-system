import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddOriginalDataToRevisions1234567890124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const table = await queryRunner.getTable('research_revisions');
    const originalDataColumn = table?.findColumnByName('original_data');

    if (!originalDataColumn) {
      await queryRunner.addColumn(
        'research_revisions',
        new TableColumn({
          name: 'original_data',
          type: 'jsonb',
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('research_revisions', 'original_data');
  }
}
