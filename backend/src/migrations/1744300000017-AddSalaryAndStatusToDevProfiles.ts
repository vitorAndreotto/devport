import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSalaryAndStatusToDevProfiles1744300000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('dev_profiles', [
      new TableColumn({
        name: 'employment_status',
        type: 'varchar',
        length: '10',
        isNullable: true,
      }),
      new TableColumn({
        name: 'salary_min',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'salary_max',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
      }),
    ]);

    await queryRunner.query(`
      ALTER TABLE dev_profiles
      ADD CONSTRAINT chk_dev_profiles_employment_status
      CHECK (employment_status IN ('looking', 'employed') OR employment_status IS NULL)
    `);

    await queryRunner.query(`
      ALTER TABLE dev_profiles
      ADD CONSTRAINT chk_dev_profiles_salary_min
      CHECK (salary_min IS NULL OR salary_min >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE dev_profiles
      ADD CONSTRAINT chk_dev_profiles_salary_max
      CHECK (salary_max IS NULL OR salary_max >= salary_min)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE dev_profiles DROP CONSTRAINT IF EXISTS chk_dev_profiles_salary_max');
    await queryRunner.query('ALTER TABLE dev_profiles DROP CONSTRAINT IF EXISTS chk_dev_profiles_salary_min');
    await queryRunner.query('ALTER TABLE dev_profiles DROP CONSTRAINT IF EXISTS chk_dev_profiles_employment_status');
    await queryRunner.dropColumns('dev_profiles', ['employment_status', 'salary_min', 'salary_max']);
  }
}
