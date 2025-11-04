import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateReviewCriteriaScoring1730920000000 implements MigrationInterface {
  name = 'UpdateReviewCriteriaScoring1730920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration updates the review criteria scoring system
    // The detailed_scores JSONB column now uses the following structure:
    // - title_score: 3 points (العنوان)
    // - abstract_score: 2 points (مستخلص البحث)
    // - methodology_score: 15 points (منهج الرسالة)
    // - background_score: 15 points (أدبيات الرسالة)
    // - results_score: 15 points (نتائج البحث وتوصياته)
    // - documentation_score: 15 points (التوثيق العلمي)
    // - originality_score: 15 points (الأصالة والابتكار)
    // - formatting_score: 2 points (إخراج البحث)
    // - research_condition_score: 10 points (حالة البحث)
    // - sources_score: 8 points (المصادر والمراجع)
    // Total: 100 points

    // Update the comment on detailed_scores column to reflect new criteria
    await queryRunner.query(`
      COMMENT ON COLUMN "reviews"."detailed_scores" IS 'معايير التحكيم التفصيلية من 100: العنوان(3)، مستخلص البحث(2)، منهج الرسالة(15)، أدبيات الرسالة(15)، نتائج البحث وتوصياته(15)، التوثيق العلمي(15)، الأصالة والابتكار(15)، إخراج البحث(2)، حالة البحث(10)، المصادر والمراجع(8)'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to previous comment
    await queryRunner.query(`
      COMMENT ON COLUMN "reviews"."detailed_scores" IS 'Detailed breakdown of scores for each evaluation criterion'
    `);
  }
}
