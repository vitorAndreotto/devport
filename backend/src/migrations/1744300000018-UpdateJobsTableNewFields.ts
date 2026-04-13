import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class UpdateJobsTableNewFields1744300000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop old location column and constraint
    await queryRunner.query('ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_location_check');
    await queryRunner.dropColumn('jobs', 'location');

    // Add new columns
    await queryRunner.addColumns('jobs', [
      new TableColumn({ name: 'company_unit_id', type: 'uuid', isNullable: true }),
      new TableColumn({ name: 'seniority', type: 'varchar', length: '15', isNullable: true }),
      new TableColumn({ name: 'show_salary', type: 'boolean', default: false }),
      new TableColumn({ name: 'benefits', type: 'jsonb', isNullable: true }),
      new TableColumn({ name: 'city_id', type: 'integer', isNullable: true }),
      new TableColumn({ name: 'zip_code', type: 'varchar', length: '9', isNullable: true }),
      new TableColumn({ name: 'street', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'neighborhood', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'number', type: 'varchar', length: '20', isNullable: true }),
      new TableColumn({ name: 'complement', type: 'varchar', length: '255', isNullable: true }),
    ]);

    // Set default seniority for existing rows, then make NOT NULL
    await queryRunner.query(`UPDATE jobs SET seniority = 'mid' WHERE seniority IS NULL`);
    await queryRunner.changeColumn('jobs', 'seniority', new TableColumn({
      name: 'seniority',
      type: 'varchar',
      length: '15',
      isNullable: false,
    }));

    // Foreign keys
    await queryRunner.createForeignKey('jobs', new TableForeignKey({
      columnNames: ['company_unit_id'],
      referencedTableName: 'company_units',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    await queryRunner.createForeignKey('jobs', new TableForeignKey({
      columnNames: ['city_id'],
      referencedTableName: 'cities',
      referencedColumnNames: ['id'],
      onDelete: 'SET NULL',
    }));

    // Indexes
    await queryRunner.createIndex('jobs', new TableIndex({ columnNames: ['company_unit_id'] }));
    await queryRunner.createIndex('jobs', new TableIndex({ columnNames: ['seniority'] }));
    await queryRunner.createIndex('jobs', new TableIndex({ columnNames: ['city_id'] }));

    // Check constraints
    await queryRunner.query(`
      ALTER TABLE jobs ADD CONSTRAINT jobs_seniority_check
      CHECK (seniority IN ('intern', 'junior', 'mid', 'senior', 'lead', 'specialist'))
    `);

    await queryRunner.query(`
      ALTER TABLE jobs ADD CONSTRAINT jobs_address_check
      CHECK (NOT (work_mode IN ('onsite', 'hybrid') AND city_id IS NULL))
    `);

    // Add requirement column to job_skills
    await queryRunner.addColumn('job_skills', new TableColumn({
      name: 'requirement',
      type: 'varchar',
      length: '15',
      default: `'required'`,
    }));

    await queryRunner.createIndex('job_skills', new TableIndex({ columnNames: ['job_id', 'requirement'] }));

    await queryRunner.query(`
      ALTER TABLE job_skills ADD CONSTRAINT job_skills_requirement_check
      CHECK (requirement IN ('required', 'expected', 'differential'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert job_skills
    await queryRunner.query('ALTER TABLE job_skills DROP CONSTRAINT IF EXISTS job_skills_requirement_check');
    const jsTable = await queryRunner.getTable('job_skills');
    const reqIdx = jsTable!.indices.find((i) => i.columnNames.includes('requirement'));
    if (reqIdx) await queryRunner.dropIndex('job_skills', reqIdx);
    await queryRunner.dropColumn('job_skills', 'requirement');

    // Revert jobs
    await queryRunner.query('ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_address_check');
    await queryRunner.query('ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_seniority_check');

    const table = await queryRunner.getTable('jobs');

    const unitFk = table!.foreignKeys.find((fk) => fk.columnNames.includes('company_unit_id'));
    if (unitFk) await queryRunner.dropForeignKey('jobs', unitFk);

    const cityFk = table!.foreignKeys.find((fk) => fk.columnNames.includes('city_id'));
    if (cityFk) await queryRunner.dropForeignKey('jobs', cityFk);

    await queryRunner.dropColumns('jobs', [
      'company_unit_id', 'seniority', 'show_salary', 'benefits',
      'city_id', 'zip_code', 'street', 'neighborhood', 'number', 'complement',
    ]);

    await queryRunner.addColumn('jobs', new TableColumn({
      name: 'location',
      type: 'varchar',
      length: '255',
      isNullable: true,
    }));

    await queryRunner.query(
      `ALTER TABLE jobs ADD CONSTRAINT jobs_location_check CHECK (NOT (work_mode IN ('onsite', 'hybrid') AND location IS NULL))`,
    );
  }
}
