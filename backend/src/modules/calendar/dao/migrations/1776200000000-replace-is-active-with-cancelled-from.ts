import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceIsActiveWithCancelledFrom1776200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recurring_lessons" DROP COLUMN "is_active"`);
    await queryRunner.query(
      `ALTER TABLE "recurring_lessons" ADD COLUMN "cancelled_from" TIMESTAMP NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recurring_lessons" DROP COLUMN "cancelled_from"`);
    await queryRunner.query(
      `ALTER TABLE "recurring_lessons" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true`,
    );
  }
}
