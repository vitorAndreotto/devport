import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateJobApplicationsTable1744300000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'job_applications',
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
            name: 'job_id',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '10',
            default: `'pending'`,
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

    await queryRunner.createForeignKey('job_applications', new TableForeignKey({
      columnNames: ['dev_profile_id'],
      referencedTableName: 'dev_profiles',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('job_applications', new TableForeignKey({
      columnNames: ['job_id'],
      referencedTableName: 'jobs',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createUniqueConstraint('job_applications', new TableUnique({
      columnNames: ['dev_profile_id', 'job_id'],
    }));

    await queryRunner.createIndex('job_applications', new TableIndex({
      columnNames: ['job_id', 'status'],
    }));

    await queryRunner.createIndex('job_applications', new TableIndex({
      columnNames: ['dev_profile_id'],
    }));

    await queryRunner.query(`
      ALTER TABLE job_applications ADD CONSTRAINT job_applications_status_check
      CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('job_applications');
  }
}
