import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateExperienceSkillsTable1744300000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'experience_skills',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'experience_id',
            type: 'uuid',
          },
          {
            name: 'skill_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'experience_skills',
      new TableForeignKey({
        columnNames: ['experience_id'],
        referencedTableName: 'experiences',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'experience_skills',
      new TableForeignKey({
        columnNames: ['skill_id'],
        referencedTableName: 'skill_tree',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'experience_skills',
      new TableUnique({ columnNames: ['experience_id', 'skill_id'] }),
    );

    await queryRunner.createIndex(
      'experience_skills',
      new TableIndex({ columnNames: ['skill_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('experience_skills');
  }
}
