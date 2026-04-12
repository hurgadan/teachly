import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { LessonEntity } from './lesson.entity';
import { GroupEntity } from '../../groups/dao/group.entity';
import { StudentEntity } from '../../students/dao/student.entity';
import { UserEntity } from '../../users/dao/user.entity';

@Entity('recurring_lessons')
@Index('IDX_RECURRING_LESSONS_TEACHER_DAY', ['teacherId', 'dayOfWeek'])
export class RecurringLessonEntity {
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

  @Column({ type: 'int', name: 'day_of_week', nullable: false })
  public dayOfWeek: number;

  @Column({ type: 'varchar', name: 'start_time', length: 5, nullable: false })
  public startTime: string;

  @Column({ type: 'int', nullable: false })
  public duration: number;

  @Column({ type: 'timestamp', name: 'cancelled_from', nullable: true })
  public cancelledFrom: Date | null;

  @OneToMany(() => LessonEntity, (lesson) => lesson.recurringLesson)
  public lessons: LessonEntity[];

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'updated_at' })
  public updatedAt: Date;
}
