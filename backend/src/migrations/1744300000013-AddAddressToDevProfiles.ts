import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddAddressToDevProfiles1744300000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove old location column
    await queryRunner.dropColumn('dev_profiles', 'location');

    // Add address columns
    await queryRunner.addColumns('dev_profiles', [
      new TableColumn({ name: 'city_id', type: 'integer', isNullable: true }),
      new TableColumn({ name: 'zip_code', type: 'varchar', length: '9', isNullable: true }),
      new TableColumn({ name: 'street', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'neighborhood', type: 'varchar', length: '255', isNullable: true }),
      new TableColumn({ name: 'number', type: 'varchar', length: '20', isNullable: true }),
      new TableColumn({ name: 'complement', type: 'varchar', length: '255', isNullable: true }),
    ]);

    await queryRunner.createForeignKey(
      'dev_profiles',
      new TableForeignKey({
        name: 'FK_dev_profiles_city',
        columnNames: ['city_id'],
        referencedTableName: 'cities',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createIndex('dev_profiles', new TableIndex({ columnNames: ['city_id'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('dev_profiles', 'IDX_dev_profiles_city_id');
    await queryRunner.dropForeignKey('dev_profiles', 'FK_dev_profiles_city');
    await queryRunner.dropColumns('dev_profiles', ['city_id', 'zip_code', 'street', 'neighborhood', 'number', 'complement']);
    await queryRunner.addColumn('dev_profiles', new TableColumn({ name: 'location', type: 'varchar', length: '255', isNullable: true }));
  }
}
