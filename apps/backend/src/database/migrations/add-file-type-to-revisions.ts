import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFileTypeToRevisions1761688900000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add file_type column to research_revisions table
    await queryRunner.addColumn(
      'research_revisions',
      new TableColumn({
        name: 'file_type',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove file_type column
    await queryRunner.dropColumn('research_revisions', 'file_type');
  }
}
