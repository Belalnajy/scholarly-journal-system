import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFileTypeToResearch1761688800000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add file_type column to research table
    await queryRunner.addColumn(
      'research',
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
    await queryRunner.dropColumn('research', 'file_type');
  }
}
