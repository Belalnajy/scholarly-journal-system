import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAcceptanceCertificateToResearch1735445574000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add acceptance certificate columns to research table
    await queryRunner.addColumn(
      'research',
      new TableColumn({
        name: 'acceptance_certificate_url',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'research',
      new TableColumn({
        name: 'acceptance_certificate_cloudinary_public_id',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'research',
      new TableColumn({
        name: 'acceptance_certificate_cloudinary_secure_url',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove acceptance certificate columns from research table
    await queryRunner.dropColumn(
      'research',
      'acceptance_certificate_cloudinary_secure_url'
    );
    await queryRunner.dropColumn(
      'research',
      'acceptance_certificate_cloudinary_public_id'
    );
    await queryRunner.dropColumn('research', 'acceptance_certificate_url');
  }
}
