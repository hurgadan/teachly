import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentsTable1775515000000 implements MigrationInterface {
  name = 'CreateStudentsTable1775515000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "students" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "teacher_id" uuid NOT NULL,
        "first_name" varchar(120) NOT NULL,
        "last_name" varchar(120),
        "phone" varchar(255),
        "email" varchar(255),
        "telegram" varchar(255),
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "price" int NOT NULL,
        "duration" int NOT NULL,
        "start_date" date,
        "comment" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_STUDENTS_ID" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_STUDENTS_TEACHER" ON "students" ("teacher_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "students"
      ADD CONSTRAINT "FK_STUDENTS_TEACHER"
      FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_STUDENTS_TEACHER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_STUDENTS_TEACHER"`);
    await queryRunner.query(`DROP TABLE "students"`);
  }
}
