import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1775700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "teacher_id" uuid NOT NULL,
        "student_id" uuid,
        "group_id" uuid,
        "amount" int NOT NULL,
        "comment" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_PAYMENTS_ID" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_PAYMENTS_TEACHER" ON "payments" ("teacher_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_PAYMENTS_STUDENT" ON "payments" ("student_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "FK_PAYMENTS_TEACHER"
      FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "FK_PAYMENTS_STUDENT"
      FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "payments"
      ADD CONSTRAINT "FK_PAYMENTS_GROUP"
      FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
  }
}
