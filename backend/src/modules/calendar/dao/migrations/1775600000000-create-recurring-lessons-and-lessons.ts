import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecurringLessonsAndLessons1775600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "recurring_lessons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "teacher_id" uuid NOT NULL,
        "student_id" uuid,
        "group_id" uuid,
        "day_of_week" int NOT NULL,
        "start_time" varchar(5) NOT NULL,
        "end_time" varchar(5) NOT NULL,
        "duration" int NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_RECURRING_LESSONS_ID" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_RECURRING_LESSONS_TEACHER_DAY"
      ON "recurring_lessons" ("teacher_id", "day_of_week")
    `);

    await queryRunner.query(`
      ALTER TABLE "recurring_lessons"
      ADD CONSTRAINT "FK_RECURRING_LESSONS_TEACHER"
      FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "recurring_lessons"
      ADD CONSTRAINT "FK_RECURRING_LESSONS_STUDENT"
      FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "recurring_lessons"
      ADD CONSTRAINT "FK_RECURRING_LESSONS_GROUP"
      FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "lessons" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "teacher_id" uuid NOT NULL,
        "student_id" uuid,
        "group_id" uuid,
        "recurring_lesson_id" uuid,
        "date" date NOT NULL,
        "start_time" varchar(5) NOT NULL,
        "end_time" varchar(5) NOT NULL,
        "duration" int NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'scheduled',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_LESSONS_ID" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_LESSONS_TEACHER_DATE"
      ON "lessons" ("teacher_id", "date")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_LESSONS_RECURRING_DATE"
      ON "lessons" ("recurring_lesson_id", "date")
      WHERE "recurring_lesson_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD CONSTRAINT "FK_LESSONS_TEACHER"
      FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD CONSTRAINT "FK_LESSONS_STUDENT"
      FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD CONSTRAINT "FK_LESSONS_GROUP"
      FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD CONSTRAINT "FK_LESSONS_RECURRING_LESSON"
      FOREIGN KEY ("recurring_lesson_id") REFERENCES "recurring_lessons"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_LESSONS_RECURRING_LESSON"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_LESSONS_GROUP"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_LESSONS_STUDENT"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_LESSONS_TEACHER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_LESSONS_RECURRING_DATE"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_LESSONS_TEACHER_DATE"`);
    await queryRunner.query(`DROP TABLE "lessons"`);

    await queryRunner.query(
      `ALTER TABLE "recurring_lessons" DROP CONSTRAINT "FK_RECURRING_LESSONS_GROUP"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_lessons" DROP CONSTRAINT "FK_RECURRING_LESSONS_STUDENT"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recurring_lessons" DROP CONSTRAINT "FK_RECURRING_LESSONS_TEACHER"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_RECURRING_LESSONS_TEACHER_DAY"`);
    await queryRunner.query(`DROP TABLE "recurring_lessons"`);
  }
}
