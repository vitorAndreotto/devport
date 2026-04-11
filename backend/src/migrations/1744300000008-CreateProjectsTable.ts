import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateProjectsTable1744300000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'projects',
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
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'technologies',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'repository_url',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'demo_url',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'source',
            type: 'varchar',
            length: '10',
            default: `'manual'`,
          },
          {
            name: 'github_repo_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'github_stars',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'github_language',
            type: 'varchar',
            length: '100',
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
      'projects',
      new TableForeignKey({
        columnNames: ['dev_profile_id'],
        referencedTableName: 'dev_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('projects', new TableIndex({ columnNames: ['dev_profile_id'] }));

    await queryRunner.createUniqueConstraint(
      'projects',
      new TableUnique({ columnNames: ['dev_profile_id', 'github_repo_id'] }),
    );

    await queryRunner.query(
      `ALTER TABLE projects ADD CONSTRAINT projects_source_check CHECK (source IN ('manual', 'github'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('projects');
  }
}
