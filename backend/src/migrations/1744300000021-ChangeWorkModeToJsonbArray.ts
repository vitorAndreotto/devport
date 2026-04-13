import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeWorkModeToJsonbArray1744300000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert existing work_mode varchar to work_modes jsonb array
    await queryRunner.query(`
      ALTER TABLE dev_profiles ADD COLUMN work_modes jsonb DEFAULT NULL
    `);

    // Migrate existing data: 'remote' → '["remote"]'
    await queryRunner.query(`
      UPDATE dev_profiles
      SET work_modes = to_jsonb(ARRAY[work_mode])
      WHERE work_mode IS NOT NULL
    `);

    // Drop old column
    await queryRunner.query(`ALTER TABLE dev_profiles DROP COLUMN work_mode`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE dev_profiles ADD COLUMN work_mode varchar(10) DEFAULT NULL
    `);

    // Take first element of array
    await queryRunner.query(`
      UPDATE dev_profiles
      SET work_mode = work_modes->>0
      WHERE work_modes IS NOT NULL AND jsonb_array_length(work_modes) > 0
    `);

    await queryRunner.query(`ALTER TABLE dev_profiles DROP COLUMN work_modes`);
  }
}
