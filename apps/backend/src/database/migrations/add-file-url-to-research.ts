import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFileUrlToResearch1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const table = await queryRunner.getTable('research');
    const fileUrlColumn = table?.findColumnByName('file_url');

    if (!fileUrlColumn) {
      await queryRunner.addColumn(
        'research',
        new TableColumn({
          name: 'file_url',
          type: 'text',
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('research', 'file_url');
  }
}
