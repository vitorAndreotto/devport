import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateDevProfilesTable1744300000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'dev_profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'bio',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'avatar_url',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'email_contact',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'work_mode',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'github_username',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'links',
            type: 'jsonb',
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
      'dev_profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('dev_profiles', new TableIndex({ columnNames: ['full_name'] }));
    await queryRunner.createIndex('dev_profiles', new TableIndex({ columnNames: ['github_username'] }));

    await queryRunner.query(
      `ALTER TABLE dev_profiles ADD CONSTRAINT dev_profiles_work_mode_check CHECK (work_mode IN ('onsite', 'hybrid', 'remote') OR work_mode IS NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('dev_profiles');
  }
}
