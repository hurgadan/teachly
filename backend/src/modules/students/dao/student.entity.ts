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

import { StudentStatus } from '../../../_contracts';
import { GroupMemberEntity } from '../../groups/dao/group-member.entity';
import { UserEntity } from '../../users/dao/user.entity';

@Entity('students')
@Index('IDX_STUDENTS_TEACHER', ['teacherId'])
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid', name: 'teacher_id', nullable: false })
  public teacherId: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  public teacher: UserEntity;

  @Column({ type: 'varchar', name: 'first_name', length: 120, nullable: false })
  public firstName: string;

  @Column({ type: 'varchar', name: 'last_name', length: 120, nullable: true })
  public lastName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public email: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public telegram: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    default: StudentStatus.ACTIVE,
  })
  public status: StudentStatus;

  @Column({ type: 'int', nullable: false })
  public price: number;

  @Column({ type: 'int', nullable: false })
  public duration: number;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'payment_type',
    nullable: false,
    default: 'prepaid',
  })
  public paymentType: string;

  @Column({ type: 'int', name: 'payment_threshold_lessons', nullable: false, default: 12 })
  public paymentThresholdLessons: number;

  @Column({ type: 'date', name: 'start_date', nullable: true })
  public startDate: string | null;

  @Column({ type: 'text', nullable: true })
  public comment: string | null;

  @OneToMany(() => GroupMemberEntity, (groupMember) => groupMember.student)
  public groupMembers: GroupMemberEntity[];

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'updated_at' })
  public updatedAt: Date;
}
