import { MigrationInterface, QueryRunner } from 'typeorm'

export default class CreateExtensionUUID1599825048188
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION "uuid-ossp"')
  }
}
