import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateCompanyUnitsTable1744300000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'company_units',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'company_profile_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'city_id',
            type: 'integer',
          },
          {
            name: 'zip_code',
            type: 'varchar',
            length: '9',
          },
          {
            name: 'street',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'neighborhood',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'number',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'complement',
            type: 'varchar',
            length: '255',
            isNullable: true,
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
      'company_units',
      new TableForeignKey({
        columnNames: ['company_profile_id'],
        referencedTableName: 'company_profiles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'company_units',
      new TableForeignKey({
        columnNames: ['city_id'],
        referencedTableName: 'cities',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createIndex(
      'company_units',
      new TableIndex({ columnNames: ['company_profile_id'] }),
    );

    await queryRunner.createIndex(
      'company_units',
      new TableIndex({ columnNames: ['city_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('company_units');
  }
}
