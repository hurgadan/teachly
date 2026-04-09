import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimezoneToUsers1775668328000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "timezone" varchar(64) NOT NULL DEFAULT 'Europe/Moscow'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN "timezone"
    `);
  }
}
