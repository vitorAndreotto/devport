import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateEducationsTable1744300000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'educations',
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
            name: 'institution',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'course',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'workload_hours',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'is_ongoing',
            type: 'boolean',
            default: false,
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
      'educations',
      new TableForeignKey({
        columnNames: ['dev_profile_id'],
        referencedTableName: 'dev_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex('educations', new TableIndex({ columnNames: ['dev_profile_id'] }));

    await queryRunner.query(
      `ALTER TABLE educations ADD CONSTRAINT educations_type_check CHECK (type IN ('technical', 'graduation', 'master', 'doctorate', 'postdoc', 'mba', 'course', 'certification'))`,
    );

    await queryRunner.query(
      `ALTER TABLE educations ADD CONSTRAINT educations_ongoing_check CHECK (NOT (is_ongoing = true AND end_date IS NOT NULL))`,
    );

    await queryRunner.query(
      `ALTER TABLE educations ADD CONSTRAINT educations_workload_check CHECK (NOT (type = 'course' AND workload_hours IS NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('educations');
  }
}
