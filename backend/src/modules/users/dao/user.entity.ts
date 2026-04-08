import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkScheduleEntity } from './work-schedule.entity';
import { Language } from '../../../_contracts';

@Entity('users')
@Index('IDX_USERS_EMAIL', ['email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true, nullable: false })
  public email: string;

  @Column({ nullable: false, name: 'password_hash' })
  public passwordHash: string;

  @Column({
    type: 'varchar',
    length: 2,
    nullable: false,
    default: Language.RU,
  })
  public language: Language;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
    default: 'Europe/Moscow',
  })
  public timezone: string;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    name: 'buffer_minutes_after_lesson',
  })
  public bufferMinutesAfterLesson: number;

  @OneToMany(() => WorkScheduleEntity, (ws) => ws.teacher, {
    cascade: true,
  })
  public workSchedules: WorkScheduleEntity[];

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'updated_at' })
  public updatedAt: Date;
}
