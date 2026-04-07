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

import { UserEntity } from './user.entity';
import { WorkInterval } from '../../../_contracts';

@Entity('work_schedules')
@Index('IDX_WORK_SCHEDULES_TEACHER_DAY', ['teacherId', 'dayOfWeek'], {
  unique: true,
})
export class WorkScheduleEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid', name: 'teacher_id', nullable: false })
  public teacherId: string;

  @ManyToOne(() => UserEntity, (user) => user.workSchedules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  public teacher: UserEntity;

  @Column({ type: 'int', name: 'day_of_week', nullable: false })
  public dayOfWeek: number; // 0 = Monday, 6 = Sunday

  @Column({ type: 'boolean', name: 'is_workday', nullable: false, default: false })
  public isWorkday: boolean;

  @Column({ type: 'jsonb', nullable: false, default: '[]' })
  public intervals: WorkInterval[];

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'updated_at' })
  public updatedAt: Date;
}
