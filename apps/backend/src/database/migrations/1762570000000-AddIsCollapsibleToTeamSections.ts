import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsCollapsibleToTeamSections1762570000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_collapsible column to team_sections table
    await queryRunner.addColumn(
      'team_sections',
      new TableColumn({
        name: 'is_collapsible',
        type: 'boolean',
        default: true,
        comment: 'If false, section is always expanded and cannot be collapsed',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove is_collapsible column from team_sections table
    await queryRunner.dropColumn('team_sections', 'is_collapsible');
  }
}
