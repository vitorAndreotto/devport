import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateJobSkillsTable1744300000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'job_skills',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'job_id',
            type: 'uuid',
          },
          {
            name: 'skill_id',
            type: 'uuid',
          },
          {
            name: 'min_level',
            type: 'varchar',
            length: '15',
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
      'job_skills',
      new TableForeignKey({
        columnNames: ['job_id'],
        referencedTableName: 'jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'job_skills',
      new TableForeignKey({
        columnNames: ['skill_id'],
        referencedTableName: 'skill_tree',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createUniqueConstraint(
      'job_skills',
      new TableUnique({ columnNames: ['job_id', 'skill_id'] }),
    );

    await queryRunner.createIndex('job_skills', new TableIndex({ columnNames: ['skill_id'] }));

    await queryRunner.query(
      `ALTER TABLE job_skills ADD CONSTRAINT job_skills_level_check CHECK (min_level IN ('beginner', 'intermediate', 'advanced', 'expert'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('job_skills');
  }
}
