import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMatchDirtyAndTriggers1744300000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // 1. Add match_dirty columns
    // =============================================

    await queryRunner.query(`
      ALTER TABLE dev_profiles
      ADD COLUMN match_dirty BOOLEAN NOT NULL DEFAULT TRUE
    `);

    await queryRunner.query(`
      ALTER TABLE jobs
      ADD COLUMN match_dirty BOOLEAN NOT NULL DEFAULT TRUE
    `);

    // Partial indexes for efficient batch queries
    await queryRunner.query(`
      CREATE INDEX idx_dev_profiles_match_dirty
      ON dev_profiles (match_dirty)
      WHERE match_dirty = TRUE
    `);

    await queryRunner.query(`
      CREATE INDEX idx_jobs_match_dirty
      ON jobs (match_dirty)
      WHERE match_dirty = TRUE
    `);

    // =============================================
    // 2. Trigger functions
    // =============================================

    // For BEFORE UPDATE triggers on the entity's own table
    // Modifies NEW directly — no extra UPDATE needed
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_self_match_dirty()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.match_dirty := TRUE;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);

    // For AFTER triggers on child tables (dev_skills, experiences)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_dev_match_dirty()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE dev_profiles SET match_dirty = TRUE
        WHERE id = COALESCE(NEW.dev_profile_id, OLD.dev_profile_id);
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);

    // For AFTER triggers on child tables (job_skills)
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_job_match_dirty()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE jobs SET match_dirty = TRUE
        WHERE id = COALESCE(NEW.job_id, OLD.job_id);
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql
    `);

    // =============================================
    // 3. Triggers
    // =============================================

    // dev_profiles: only fires when match-relevant columns change
    await queryRunner.query(`
      CREATE TRIGGER trg_dev_profile_match_dirty
      BEFORE UPDATE OF work_modes, city_id, salary_min, salary_max
      ON dev_profiles
      FOR EACH ROW
      EXECUTE FUNCTION set_self_match_dirty()
    `);

    // dev_skills: any change affects match score
    await queryRunner.query(`
      CREATE TRIGGER trg_dev_skill_match_dirty
      AFTER INSERT OR UPDATE OR DELETE
      ON dev_skills
      FOR EACH ROW
      EXECUTE FUNCTION set_dev_match_dirty()
    `);

    // experiences: any change affects total experience months
    await queryRunner.query(`
      CREATE TRIGGER trg_experience_match_dirty
      AFTER INSERT OR UPDATE OR DELETE
      ON experiences
      FOR EACH ROW
      EXECUTE FUNCTION set_dev_match_dirty()
    `);

    // jobs: only fires when match-relevant columns change
    await queryRunner.query(`
      CREATE TRIGGER trg_job_match_dirty
      BEFORE UPDATE OF work_mode, city_id, salary_min, salary_max, seniority, min_experience_years
      ON jobs
      FOR EACH ROW
      EXECUTE FUNCTION set_self_match_dirty()
    `);

    // job_skills: any change affects match score
    await queryRunner.query(`
      CREATE TRIGGER trg_job_skill_match_dirty
      AFTER INSERT OR UPDATE OR DELETE
      ON job_skills
      FOR EACH ROW
      EXECUTE FUNCTION set_job_match_dirty()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_job_skill_match_dirty ON job_skills`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_job_match_dirty ON jobs`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_experience_match_dirty ON experiences`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_dev_skill_match_dirty ON dev_skills`);
    await queryRunner.query(`DROP TRIGGER IF EXISTS trg_dev_profile_match_dirty ON dev_profiles`);

    // Drop functions
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_job_match_dirty()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_dev_match_dirty()`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS set_self_match_dirty()`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_jobs_match_dirty`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_dev_profiles_match_dirty`);

    // Drop columns
    await queryRunner.query(`ALTER TABLE jobs DROP COLUMN IF EXISTS match_dirty`);
    await queryRunner.query(`ALTER TABLE dev_profiles DROP COLUMN IF EXISTS match_dirty`);
  }
}
