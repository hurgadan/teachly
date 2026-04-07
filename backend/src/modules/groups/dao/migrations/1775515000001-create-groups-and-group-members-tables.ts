import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupsAndGroupMembersTables1775515000001 implements MigrationInterface {
  name = 'CreateGroupsAndGroupMembersTables1775515000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "teacher_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "duration" int NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_GROUPS_ID" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_GROUPS_TEACHER" ON "groups" ("teacher_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "groups"
      ADD CONSTRAINT "FK_GROUPS_TEACHER"
      FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE "group_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        CONSTRAINT "PK_GROUP_MEMBERS_ID" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_GROUP_MEMBERS_GROUP_STUDENT"
      ON "group_members" ("group_id", "student_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "group_members"
      ADD CONSTRAINT "FK_GROUP_MEMBERS_GROUP"
      FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "group_members"
      ADD CONSTRAINT "FK_GROUP_MEMBERS_STUDENT"
      FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_members" DROP CONSTRAINT "FK_GROUP_MEMBERS_STUDENT"`,
    );
    await queryRunner.query(`ALTER TABLE "group_members" DROP CONSTRAINT "FK_GROUP_MEMBERS_GROUP"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_GROUP_MEMBERS_GROUP_STUDENT"`);
    await queryRunner.query(`DROP TABLE "group_members"`);

    await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_GROUPS_TEACHER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_GROUPS_TEACHER"`);
    await queryRunner.query(`DROP TABLE "groups"`);
  }
}
