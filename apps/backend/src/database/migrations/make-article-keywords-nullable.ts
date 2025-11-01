import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeArticleKeywordsNullable1761688000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make keywords column nullable in articles table
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "keywords" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert: Make keywords column NOT NULL again
    // First, update any NULL values to empty array
    await queryRunner.query(
      `UPDATE "articles" SET "keywords" = '[]' WHERE "keywords" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ALTER COLUMN "keywords" SET NOT NULL`
    );
  }
}
