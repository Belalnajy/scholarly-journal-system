import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDetailedScoringToReviews1730472000000 implements MigrationInterface {
  name = 'AddDetailedScoringToReviews1730472000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add total_score column
    await queryRunner.query(`
      ALTER TABLE "reviews" 
      ADD COLUMN "total_score" NUMERIC(5,2)
    `);

    // Add detailed_scores column (JSONB)
    await queryRunner.query(`
      ALTER TABLE "reviews" 
      ADD COLUMN "detailed_scores" JSONB
    `);

    // Add comment for documentation
    await queryRunner.query(`
      COMMENT ON COLUMN "reviews"."total_score" IS 'Total score out of 100 based on detailed criteria'
    `);

    await queryRunner.query(`
      COMMENT ON COLUMN "reviews"."detailed_scores" IS 'Detailed breakdown of scores for each evaluation criterion'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns
    await queryRunner.query(`
      ALTER TABLE "reviews" 
      DROP COLUMN "detailed_scores"
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews" 
      DROP COLUMN "total_score"
    `);
  }
}
