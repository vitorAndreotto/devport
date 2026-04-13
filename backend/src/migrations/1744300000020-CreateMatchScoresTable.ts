import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex, TableUnique } from 'typeorm';

export class CreateMatchScoresTable1744300000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'match_scores',
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
            name: 'score',
            type: 'integer',
          },
          {
            name: 'dev_hash',
            type: 'varchar',
            length: '32',
          },
          {
            name: 'job_hash',
            type: 'varchar',
            length: '32',
          },
          {
            name: 'skill_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'experience_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'modality_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'salary_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'calculated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('match_scores', new TableForeignKey({
      columnNames: ['dev_profile_id'],
      referencedTableName: 'dev_profiles',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('match_scores', new TableForeignKey({
      columnNames: ['job_id'],
      referencedTableName: 'jobs',
      referencedColumnNames: ['id'],
      onDelete: 'CASCADE',
    }));

    await queryRunner.createUniqueConstraint('match_scores', new TableUnique({
      columnNames: ['dev_profile_id', 'job_id'],
    }));

    await queryRunner.createIndex('match_scores', new TableIndex({
      columnNames: ['job_id', 'score'],
    }));

    await queryRunner.createIndex('match_scores', new TableIndex({
      columnNames: ['dev_profile_id', 'score'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('match_scores');
  }
}
