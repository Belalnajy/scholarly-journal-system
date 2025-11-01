import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEditedFileToReviews1761689000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add edited file columns to reviews table
    await queryRunner.addColumn(
      'reviews',
      new TableColumn({
        name: 'edited_file_url',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'reviews',
      new TableColumn({
        name: 'edited_file_cloudinary_public_id',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'reviews',
      new TableColumn({
        name: 'edited_file_cloudinary_secure_url',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'reviews',
      new TableColumn({
        name: 'edited_file_type',
        type: 'varchar',
        length: '10',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove edited file columns
    await queryRunner.dropColumn('reviews', 'edited_file_type');
    await queryRunner.dropColumn('reviews', 'edited_file_cloudinary_secure_url');
    await queryRunner.dropColumn('reviews', 'edited_file_cloudinary_public_id');
    await queryRunner.dropColumn('reviews', 'edited_file_url');
  }
}
