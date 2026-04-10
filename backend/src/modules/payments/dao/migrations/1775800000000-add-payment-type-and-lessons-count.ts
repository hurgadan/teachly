import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentTypeAndLessonsCount1775800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD COLUMN "lessons_count" INT NOT NULL DEFAULT 1,
      ADD COLUMN "type" VARCHAR(20) NOT NULL DEFAULT 'prepaid'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payments"
      DROP COLUMN "lessons_count",
      DROP COLUMN "type"
    `);
  }
}
