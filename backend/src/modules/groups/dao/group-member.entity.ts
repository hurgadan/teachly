import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { GroupEntity } from './group.entity';
import { StudentEntity } from '../../students/dao/student.entity';

@Entity('group_members')
@Index('IDX_GROUP_MEMBERS_GROUP_STUDENT', ['groupId', 'studentId'], {
  unique: true,
})
export class GroupMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid', name: 'group_id', nullable: false })
  public groupId: string;

  @ManyToOne(() => GroupEntity, (group) => group.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  public group: GroupEntity;

  @Column({ type: 'uuid', name: 'student_id', nullable: false })
  public studentId: string;

  @ManyToOne(() => StudentEntity, (student) => student.groupMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  public student: StudentEntity;
}
