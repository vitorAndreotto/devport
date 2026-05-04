import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitSalaryByModelAndAddRadius1744300000023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 0. Drop old triggers that reference salary_min/salary_max
    // =============================================

    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_dev_profile_match_dirty ON dev_profiles`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_job_match_dirty ON jobs`);

    // =============================================
    // 1. dev_profiles: add new salary columns + radius
    // =============================================

    await queryRunner.query(`
      ALTER TABLE dev_profiles
      ADD COLUMN salary_clt_min DECIMAL(10,2) NULL,
      ADD COLUMN salary_clt_max DECIMAL(10,2) NULL,
      ADD COLUMN salary_pj_min DECIMAL(10,2) NULL,
      ADD COLUMN salary_pj_max DECIMAL(10,2) NULL,
      ADD COLUMN max_radius_km INTEGER NULL
    `);

    // Migrate existing salary data to CLT columns (best guess — was generic)
    await queryRunner.query(`
      UPDATE dev_profiles
      SET salary_clt_min = salary_min,
          salary_clt_max = salary_max
      WHERE salary_min IS NOT NULL
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE dev_profiles
      DROP COLUMN IF EXISTS salary_min,
      DROP COLUMN IF EXISTS salary_max
    `);

    // Check constraints for dev_profiles
    await queryRunner.query(`
      ALTER TABLE dev_profiles
      ADD CONSTRAINT chk_dev_salary_clt CHECK (salary_clt_min IS NULL OR salary_clt_min >= 0),
      ADD CONSTRAINT chk_dev_salary_clt_range CHECK (salary_clt_max IS NULL OR salary_clt_max >= salary_clt_min),
      ADD CONSTRAINT chk_dev_salary_pj CHECK (salary_pj_min IS NULL OR salary_pj_min >= 0),
      ADD CONSTRAINT chk_dev_salary_pj_range CHECK (salary_pj_max IS NULL OR salary_pj_max >= salary_pj_min),
      ADD CONSTRAINT chk_dev_max_radius CHECK (max_radius_km IS NULL OR (max_radius_km >= 1 AND max_radius_km <= 60))
    `);

    // =============================================
    // 2. jobs: add new salary columns + radius
    // =============================================

    await queryRunner.query(`
      ALTER TABLE jobs
      ADD COLUMN salary_clt_min DECIMAL(10,2) NULL,
      ADD COLUMN salary_clt_max DECIMAL(10,2) NULL,
      ADD COLUMN salary_pj_min DECIMAL(10,2) NULL,
      ADD COLUMN salary_pj_max DECIMAL(10,2) NULL,
      ADD COLUMN max_radius_km INTEGER NULL
    `);

    // Migrate existing data: if contract_model is clt or clt_pj → put in CLT
    await queryRunner.query(`
      UPDATE jobs
      SET salary_clt_min = salary_min,
          salary_clt_max = salary_max
      WHERE contract_model IN ('clt', 'clt_pj')
    `);

    // If contract_model is pj or clt_pj → put in PJ
    await queryRunner.query(`
      UPDATE jobs
      SET salary_pj_min = salary_min,
          salary_pj_max = salary_max
      WHERE contract_model IN ('pj', 'clt_pj')
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE jobs
      DROP COLUMN IF EXISTS salary_min,
      DROP COLUMN IF EXISTS salary_max
    `);

    // Check constraints for jobs
    await queryRunner.query(`
      ALTER TABLE jobs
      ADD CONSTRAINT chk_job_salary_clt CHECK (salary_clt_min IS NULL OR salary_clt_min >= 0),
      ADD CONSTRAINT chk_job_salary_clt_range CHECK (salary_clt_max IS NULL OR salary_clt_max >= salary_clt_min),
      ADD CONSTRAINT chk_job_salary_pj CHECK (salary_pj_min IS NULL OR salary_pj_min >= 0),
      ADD CONSTRAINT chk_job_salary_pj_range CHECK (salary_pj_max IS NULL OR salary_pj_max >= salary_pj_min),
      ADD CONSTRAINT chk_job_max_radius CHECK (max_radius_km IS NULL OR (max_radius_km >= 1 AND max_radius_km <= 60))
    `);

    // =============================================
    // 3. Recreate match_dirty triggers with new column lists
    // =============================================
    await queryRunner.query(`
      CREATE TRIGGER trg_dev_profile_match_dirty
      BEFORE UPDATE OF work_modes, city_id, max_radius_km, salary_clt_min, salary_clt_max, salary_pj_min, salary_pj_max
      ON dev_profiles
      FOR EACH ROW
      EXECUTE FUNCTION set_self_match_dirty()
    `);

    await queryRunner.query(`
      CREATE TRIGGER trg_job_match_dirty
      BEFORE UPDATE OF work_mode, city_id, max_radius_km, salary_clt_min, salary_clt_max, salary_pj_min, salary_pj_max, seniority, min_experience_years, contract_model
      ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION set_self_match_dirty()
    `);

    // Mark all as dirty since salary structure changed
    await queryRunner.query(`UPDATE dev_profiles SET match_dirty = TRUE`);
    await queryRunner.query(`UPDATE jobs SET match_dirty = TRUE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_dev_profile_match_dirty ON dev_profiles`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_job_match_dirty ON jobs`);

    // Restore old salary columns on jobs
    await queryRunner.query(`ALTER TABLE jobs ADD COLUMN salary_min DECIMAL(10,2), ADD COLUMN salary_max DECIMAL(10,2)`);
    await queryRunner.query(`UPDATE jobs SET salary_min = COALESCE(salary_clt_min, salary_pj_min), salary_max = COALESCE(salary_clt_max, salary_pj_max)`);
    await queryRunner.query(`ALTER TABLE jobs DROP CONSTRAINT IF EXISTS chk_job_salary_clt, DROP CONSTRAINT IF EXISTS chk_job_salary_clt_range, DROP CONSTRAINT IF EXISTS chk_job_salary_pj, DROP CONSTRAINT IF EXISTS chk_job_salary_pj_range, DROP CONSTRAINT IF EXISTS chk_job_max_radius`);
    await queryRunner.query(`ALTER TABLE jobs DROP COLUMN salary_clt_min, DROP COLUMN salary_clt_max, DROP COLUMN salary_pj_min, DROP COLUMN salary_pj_max, DROP COLUMN max_radius_km`);

    // Restore old salary columns on dev_profiles
    await queryRunner.query(`ALTER TABLE dev_profiles ADD COLUMN salary_min DECIMAL(10,2), ADD COLUMN salary_max DECIMAL(10,2)`);
    await queryRunner.query(`UPDATE dev_profiles SET salary_min = COALESCE(salary_clt_min, salary_pj_min), salary_max = COALESCE(salary_clt_max, salary_pj_max)`);
    await queryRunner.query(`ALTER TABLE dev_profiles DROP CONSTRAINT IF EXISTS chk_dev_salary_clt, DROP CONSTRAINT IF EXISTS chk_dev_salary_clt_range, DROP CONSTRAINT IF EXISTS chk_dev_salary_pj, DROP CONSTRAINT IF EXISTS chk_dev_salary_pj_range, DROP CONSTRAINT IF EXISTS chk_dev_max_radius`);
    await queryRunner.query(`ALTER TABLE dev_profiles DROP COLUMN salary_clt_min, DROP COLUMN salary_clt_max, DROP COLUMN salary_pj_min, DROP COLUMN salary_pj_max, DROP COLUMN max_radius_km`);

    // Recreate old triggers
    await queryRunner.query(`
      CREATE TRIGGER trg_dev_profile_match_dirty
      BEFORE UPDATE OF work_modes, city_id, salary_min, salary_max
      ON dev_profiles FOR EACH ROW EXECUTE FUNCTION set_self_match_dirty()
    `);
    await queryRunner.query(`
      CREATE TRIGGER trg_job_match_dirty
      BEFORE UPDATE OF work_mode, city_id, salary_min, salary_max, seniority, min_experience_years
      ON jobs FOR EACH ROW EXECUTE FUNCTION set_self_match_dirty()
    `);
  }
}
