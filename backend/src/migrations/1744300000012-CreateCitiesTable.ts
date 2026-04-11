import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCitiesTable1744300000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cities',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
          },
          {
            name: 'state_id',
            type: 'integer',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
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
            name: 'is_capital',
            type: 'boolean',
            default: false,
          },
          {
            name: 'siafi_id',
            type: 'integer',
          },
          {
            name: 'ddd',
            type: 'integer',
          },
          {
            name: 'timezone',
            type: 'varchar',
            length: '50',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'cities',
      new TableForeignKey({
        columnNames: ['state_id'],
        referencedTableName: 'states',
        referencedColumnNames: ['id'],
      }),
    );

    await queryRunner.createIndex('cities', new TableIndex({ columnNames: ['state_id'] }));
    await queryRunner.createIndex('cities', new TableIndex({ columnNames: ['name'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cities');
  }
}
