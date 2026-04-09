import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateLessonsToStartAt1775669000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "lessons"
      ADD COLUMN "start_at" timestamptz
    `);

    await queryRunner.query(`
      UPDATE "lessons" l
      SET "start_at" = (
        (l."date"::text || ' ' || l."start_time" || ':00')::timestamp
        AT TIME ZONE u."timezone"
      )
      FROM "users" u
      WHERE l."teacher_id" = u."id"
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons"
      ALTER COLUMN "start_at" SET NOT NULL
    `);

    await queryRunner.query(`DROP INDEX "public"."IDX_LESSONS_TEACHER_DATE"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_LESSONS_RECURRING_DATE"`);

    await queryRunner.query(`
      CREATE INDEX "IDX_LESSONS_TEACHER_START_AT"
      ON "lessons" ("teacher_id", "start_at")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_LESSONS_RECURRING_START_AT"
      ON "lessons" ("recurring_lesson_id", "start_at")
      WHERE "recurring_lesson_id" IS NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "date"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "start_time"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lessons" ADD COLUMN "date" date`);
    await queryRunner.query(`ALTER TABLE "lessons" ADD COLUMN "start_time" varchar(5)`);

    await queryRunner.query(`
      UPDATE "lessons" l
      SET
        "date" = (l."start_at" AT TIME ZONE u."timezone")::date,
        "start_time" = to_char(l."start_at" AT TIME ZONE u."timezone", 'HH24:MI')
      FROM "users" u
      WHERE l."teacher_id" = u."id"
    `);

    await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "date" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "start_time" SET NOT NULL`);

    await queryRunner.query(`DROP INDEX "public"."IDX_LESSONS_RECURRING_START_AT"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_LESSONS_TEACHER_START_AT"`);

    await queryRunner.query(`
      CREATE INDEX "IDX_LESSONS_TEACHER_DATE"
      ON "lessons" ("teacher_id", "date")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_LESSONS_RECURRING_DATE"
      ON "lessons" ("recurring_lesson_id", "date")
      WHERE "recurring_lesson_id" IS NOT NULL
    `);

    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "start_at"`);
  }
}
