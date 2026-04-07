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

import { GroupMemberEntity } from './group-member.entity';
import { UserEntity } from '../../users/dao/user.entity';

@Entity('groups')
@Index('IDX_GROUPS_TEACHER', ['teacherId'])
export class GroupEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid', name: 'teacher_id', nullable: false })
  public teacherId: string;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  public teacher: UserEntity;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public name: string;

  @Column({ type: 'int', nullable: false })
  public duration: number;

  @OneToMany(() => GroupMemberEntity, (groupMember) => groupMember.group, {
    cascade: true,
  })
  public members: GroupMemberEntity[];

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  public createdAt: Date;

  @UpdateDateColumn({ nullable: false, name: 'updated_at' })
  public updatedAt: Date;
}
