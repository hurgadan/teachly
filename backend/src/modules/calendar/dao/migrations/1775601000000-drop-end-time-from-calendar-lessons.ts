import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropEndTimeFromCalendarLessons1775601000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "end_time"`);
    await queryRunner.query(`ALTER TABLE "recurring_lessons" DROP COLUMN "end_time"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recurring_lessons" ADD "end_time" varchar(5) NOT NULL DEFAULT '00:00'`,
    );
    await queryRunner.query(
      `UPDATE "recurring_lessons" SET "end_time" = to_char((to_timestamp("start_time", 'HH24:MI') + ("duration" || ' minutes')::interval), 'HH24:MI')`,
    );
    await queryRunner.query(`ALTER TABLE "recurring_lessons" ALTER COLUMN "end_time" DROP DEFAULT`);

    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "end_time" varchar(5) NOT NULL DEFAULT '00:00'`,
    );
    await queryRunner.query(
      `UPDATE "lessons" SET "end_time" = to_char((to_timestamp("start_time", 'HH24:MI') + ("duration" || ' minutes')::interval), 'HH24:MI')`,
    );
    await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "end_time" DROP DEFAULT`);
  }
}
