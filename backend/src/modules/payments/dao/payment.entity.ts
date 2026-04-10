import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GroupEntity } from '../../groups/dao/group.entity';
import { StudentEntity } from '../../students/dao/student.entity';
import { UserEntity } from '../../users/dao/user.entity';

@Entity('payments')
@Index('IDX_PAYMENTS_TEACHER', ['teacherId'])
@Index('IDX_PAYMENTS_STUDENT', ['studentId'])
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid', name: 'teacher_id', nullable: false })
  public teacherId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  public teacher: UserEntity;

  @Column({ type: 'uuid', name: 'student_id', nullable: true })
  public studentId: string | null;

  @ManyToOne(() => StudentEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'student_id' })
  public student: StudentEntity | null;

  @Column({ type: 'uuid', name: 'group_id', nullable: true })
  public groupId: string | null;

  @ManyToOne(() => GroupEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'group_id' })
  public group: GroupEntity | null;

  @Column({ type: 'int', nullable: false })
  public amount: number;

  @Column({ type: 'int', name: 'lessons_count', nullable: false, default: 1 })
  public lessonsCount: number;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'prepaid' })
  public type: string;

  @Column({ type: 'text', nullable: true })
  public comment: string | null;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;
}
