import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCompanyProfilesTable1744300000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'company_profiles',
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
            name: 'handle',
            type: 'varchar',
            length: '40',
            isUnique: true,
          },
          {
            name: 'company_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'cnpj',
            type: 'varchar',
            length: '18',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '1000',
          },
          {
            name: 'logo_url',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            length: '2048',
            isNullable: true,
          },
          {
            name: 'industry',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'size',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
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
      'company_profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('company_profiles', new TableIndex({ columnNames: ['company_name'] }));

    await queryRunner.query(
      `ALTER TABLE company_profiles ADD CONSTRAINT company_profiles_handle_check CHECK (handle ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$')`,
    );

    await queryRunner.query(
      `ALTER TABLE company_profiles ADD CONSTRAINT company_profiles_size_check CHECK (size IN ('startup', 'small', 'medium', 'large', 'enterprise'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('company_profiles');
  }
}
