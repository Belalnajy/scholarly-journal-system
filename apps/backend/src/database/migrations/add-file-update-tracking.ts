import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFileUpdateTracking1730259600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add file_updated_at column to research table
    await queryRunner.addColumn(
      'research',
      new TableColumn({
        name: 'file_updated_at',
        type: 'timestamp',
        isNullable: true,
      })
    );

    // Add file_updated_by column to research table
    await queryRunner.addColumn(
      'research',
      new TableColumn({
        name: 'file_updated_by',
        type: 'uuid',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove file_updated_by column
    await queryRunner.dropColumn('research', 'file_updated_by');
    
    // Remove file_updated_at column
    await queryRunner.dropColumn('research', 'file_updated_at');
  }
}
