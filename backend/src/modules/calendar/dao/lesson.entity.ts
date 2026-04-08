import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RecurringLessonEntity } from './recurring-lesson.entity';
import { LessonStatus } from '../../../_contracts/calendar';
import { GroupEntity } from '../../groups/dao/group.entity';
import { StudentEntity } from '../../students/dao/student.entity';
import { UserEntity } from '../../users/dao/user.entity';

@Entity('lessons')
@Index('IDX_LESSONS_TEACHER_DATE', ['teacherId', 'date'])
@Index('IDX_LESSONS_RECURRING_DATE', ['recurringLessonId', 'date'], { unique: true })
export class LessonEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid', name: 'teacher_id', nullable: false })
  public teacherId: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  public teacher: UserEntity;

  @Column({ type: 'uuid', name: 'student_id', nullable: true })
  public studentId: string | null;

  @ManyToOne(() => StudentEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  public student: StudentEntity | null;

  @Column({ type: 'uuid', name: 'group_id', nullable: true })
  public groupId: string | null;

  @ManyToOne(() => GroupEntity, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  public group: GroupEntity | null;

  @Column({ type: 'uuid', name: 'recurring_lesson_id', nullable: true })
  public recurringLessonId: string | null;

  @ManyToOne(() => RecurringLessonEntity, (recurringLesson) => recurringLesson.lessons, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'recurring_lesson_id' })
  public recurringLesson: RecurringLessonEntity | null;

  @Column({ type: 'date', nullable: false })
  public date: string;

  @Column({ type: 'varchar', name: 'start_time', length: 5, nullable: false })
  public startTime: string;

  @Column({ type: 'int', nullable: false })
  public duration: number;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    default: LessonStatus.SCHEDULED,
  })
  public status: LessonStatus;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'updated_at' })
  public updatedAt: Date;
}
