import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCloudinaryFields1729681348000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add Cloudinary fields to research table
    await queryRunner.addColumn(
      'research',
      new TableColumn({
        name: 'cloudinary_public_id',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'research',
      new TableColumn({
        name: 'cloudinary_secure_url',
        type: 'text',
        isNullable: true,
      })
    );

    // Add Cloudinary fields to research_files table
    await queryRunner.addColumn(
      'research_files',
      new TableColumn({
        name: 'cloudinary_public_id',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'research_files',
      new TableColumn({
        name: 'cloudinary_secure_url',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'research_files',
      new TableColumn({
        name: 'cloudinary_format',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'research_files',
      new TableColumn({
        name: 'cloudinary_resource_type',
        type: 'text',
        isNullable: true,
      })
    );

    // Add Cloudinary fields to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar_cloudinary_public_id',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'avatar_cloudinary_secure_url',
        type: 'text',
        isNullable: true,
      })
    );

    // Add Cloudinary fields to research_revisions table
    await queryRunner.addColumn(
      'research_revisions',
      new TableColumn({
        name: 'cloudinary_public_id',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'research_revisions',
      new TableColumn({
        name: 'cloudinary_secure_url',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove Cloudinary fields from research table
    await queryRunner.dropColumn('research', 'cloudinary_public_id');
    await queryRunner.dropColumn('research', 'cloudinary_secure_url');

    // Remove Cloudinary fields from research_files table
    await queryRunner.dropColumn('research_files', 'cloudinary_public_id');
    await queryRunner.dropColumn('research_files', 'cloudinary_secure_url');
    await queryRunner.dropColumn('research_files', 'cloudinary_format');
    await queryRunner.dropColumn('research_files', 'cloudinary_resource_type');

    // Remove Cloudinary fields from users table
    await queryRunner.dropColumn('users', 'avatar_cloudinary_public_id');
    await queryRunner.dropColumn('users', 'avatar_cloudinary_secure_url');

    // Remove Cloudinary fields from research_revisions table
    await queryRunner.dropColumn('research_revisions', 'cloudinary_public_id');
    await queryRunner.dropColumn('research_revisions', 'cloudinary_secure_url');
  }
}
