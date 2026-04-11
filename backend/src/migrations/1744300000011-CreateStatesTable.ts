import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateStatesTable1744300000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'states',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'abbr',
            type: 'varchar',
            length: '2',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 6,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 10,
            scale: 6,
          },
          {
            name: 'region',
            type: 'varchar',
            length: '20',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('states');
  }
}
