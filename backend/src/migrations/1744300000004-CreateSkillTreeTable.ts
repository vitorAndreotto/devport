import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateSkillTreeTable1744300000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'skill_tree',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '120',
            isUnique: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'skill_tree',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'skill_tree',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex('skill_tree', new TableIndex({ columnNames: ['category'] }));
    await queryRunner.createIndex('skill_tree', new TableIndex({ columnNames: ['parent_id'] }));
    await queryRunner.createIndex('skill_tree', new TableIndex({ columnNames: ['name'] }));

    await queryRunner.query(
      `ALTER TABLE skill_tree ADD CONSTRAINT skill_tree_category_check CHECK (category IN ('language', 'framework', 'database', 'devops', 'tool', 'methodology', 'soft_skill', 'other'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('skill_tree');
  }
}
