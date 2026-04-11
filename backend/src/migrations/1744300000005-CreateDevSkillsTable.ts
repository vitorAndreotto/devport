import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateDevSkillsTable1744300000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'dev_skills',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'dev_profile_id',
            type: 'uuid',
          },
          {
            name: 'skill_id',
            type: 'uuid',
          },
          {
            name: 'level',
            type: 'varchar',
            length: '15',
          },
          {
            name: 'years_experience',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'dev_skills',
      new TableForeignKey({
        columnNames: ['dev_profile_id'],
        referencedTableName: 'dev_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'dev_skills',
      new TableForeignKey({
        columnNames: ['skill_id'],
        referencedTableName: 'skill_tree',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'dev_skills',
      new TableUnique({ columnNames: ['dev_profile_id', 'skill_id'] }),
    );

    await queryRunner.createIndex('dev_skills', new TableIndex({ columnNames: ['skill_id'] }));

    await queryRunner.query(
      `ALTER TABLE dev_skills ADD CONSTRAINT dev_skills_level_check CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert'))`,
    );

    await queryRunner.query(
      `ALTER TABLE dev_skills ADD CONSTRAINT dev_skills_years_check CHECK (years_experience >= 0 OR years_experience IS NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('dev_skills');
  }
}
