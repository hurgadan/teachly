import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class AddTeacherProfileAndWorkSchedules1775509304201
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'language',
        type: 'varchar',
        length: '2',
        isNullable: false,
        default: "'ru'",
      }),
      new TableColumn({
        name: 'buffer_minutes_after_lesson',
        type: 'int',
        isNullable: false,
        default: 0,
      }),
    ]);

    await queryRunner.createTable(
      new Table({
        name: 'work_schedules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'teacher_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'day_of_week',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'is_workday',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'intervals',
            type: 'jsonb',
            isNullable: false,
            default: "'[]'",
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        indices: [
          new TableIndex({
            name: 'IDX_WORK_SCHEDULES_TEACHER_DAY',
            columnNames: ['teacher_id', 'day_of_week'],
            isUnique: true,
          }),
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'work_schedules',
      new TableForeignKey({
        name: 'FK_WORK_SCHEDULES_TEACHER',
        columnNames: ['teacher_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('work_schedules');
    await queryRunner.dropColumn('users', 'buffer_minutes_after_lesson');
    await queryRunner.dropColumn('users', 'language');
  }
}
