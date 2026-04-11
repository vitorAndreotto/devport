import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateJobsTable1744300000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'jobs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'company_profile_id',
            type: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'min_experience_years',
            type: 'integer',
          },
          {
            name: 'contract_model',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'salary_min',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'salary_max',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'work_mode',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '10',
            default: `'open'`,
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
      'jobs',
      new TableForeignKey({
        columnNames: ['company_profile_id'],
        referencedTableName: 'company_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('jobs', new TableIndex({ columnNames: ['company_profile_id'] }));
    await queryRunner.createIndex('jobs', new TableIndex({ columnNames: ['status'] }));
    await queryRunner.createIndex('jobs', new TableIndex({ columnNames: ['work_mode'] }));
    await queryRunner.createIndex('jobs', new TableIndex({ columnNames: ['created_at'] }));

    await queryRunner.query(
      `ALTER TABLE jobs ADD CONSTRAINT jobs_contract_model_check CHECK (contract_model IN ('clt', 'pj', 'clt_pj'))`,
    );

    await queryRunner.query(
      `ALTER TABLE jobs ADD CONSTRAINT jobs_work_mode_check CHECK (work_mode IN ('onsite', 'hybrid', 'remote'))`,
    );

    await queryRunner.query(
      `ALTER TABLE jobs ADD CONSTRAINT jobs_status_check CHECK (status IN ('open', 'closed'))`,
    );

    await queryRunner.query(
      `ALTER TABLE jobs ADD CONSTRAINT jobs_salary_check CHECK (salary_min >= 0 AND salary_max >= salary_min)`,
    );

    await queryRunner.query(
      `ALTER TABLE jobs ADD CONSTRAINT jobs_location_check CHECK (NOT (work_mode IN ('onsite', 'hybrid') AND location IS NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('jobs');
  }
}
