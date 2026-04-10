import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentPaymentSettings1775900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
      ADD COLUMN "payment_type" VARCHAR(20) NOT NULL DEFAULT 'prepaid',
      ADD COLUMN "payment_threshold_lessons" INT NOT NULL DEFAULT 12
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "students"
      DROP COLUMN "payment_type",
      DROP COLUMN "payment_threshold_lessons"
    `);
  }
}
