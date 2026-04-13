import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddAddressToCompanyProfiles1744300000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove old location column
    await queryRunner.dropColumn('company_profiles', 'location');

    // Add address columns
    await queryRunner.addColumns('company_profiles', [
      new TableColumn({ name: 'city_id', type: 'integer', isNullable: true }),
      new TableColumn({ name: 'zip_code', type: 'varchar', length: '9', isNullable: true }),
      new TableColumn({ name: 'street', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'neighborhood', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'number', type: 'varchar', length: '20', isNullable: true }),
      new TableColumn({ name: 'complement', type: 'varchar', length: '255', isNullable: true }),
    ]);

    await queryRunner.createForeignKey(
      'company_profiles',
      new TableForeignKey({
        columnNames: ['city_id'],
        referencedTableName: 'cities',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex(
      'company_profiles',
      new TableIndex({ columnNames: ['city_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('company_profiles');

    const fk = table!.foreignKeys.find((fk) => fk.columnNames.includes('city_id'));
    if (fk) await queryRunner.dropForeignKey('company_profiles', fk);

    const idx = table!.indices.find((i) => i.columnNames.includes('city_id'));
    if (idx) await queryRunner.dropIndex('company_profiles', idx);

    await queryRunner.dropColumns('company_profiles', [
      'city_id', 'zip_code', 'street', 'neighborhood', 'number', 'complement',
    ]);

    await queryRunner.addColumn(
      'company_profiles',
      new TableColumn({ name: 'location', type: 'varchar', length: '255' }),
    );
  }
}
