import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAcceptanceCertificateToArticle1762563500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'articles',
      new TableColumn({
        name: 'acceptance_certificate_url',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'articles',
      new TableColumn({
        name: 'acceptance_certificate_cloudinary_public_id',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'articles',
      new TableColumn({
        name: 'acceptance_certificate_cloudinary_secure_url',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'articles',
      'acceptance_certificate_cloudinary_secure_url'
    );
    await queryRunner.dropColumn(
      'articles',
      'acceptance_certificate_cloudinary_public_id'
    );
    await queryRunner.dropColumn('articles', 'acceptance_certificate_url');
  }
}
