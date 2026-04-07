import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupMemberEntity } from '../dao/group-member.entity';

@Injectable()
export class GroupMembersRepository {
  constructor(
    @InjectRepository(GroupMemberEntity)
    private readonly repository: Repository<GroupMemberEntity>,
  ) {}

  public async replaceForGroup(groupId: string, studentIds: string[]): Promise<void> {
    await this.repository.delete({ groupId });

    if (!studentIds.length) {
      return;
    }

    await this.repository.save(
      studentIds.map((studentId) =>
        this.repository.create({
          groupId,
          studentId,
        }),
      ),
    );
  }
}
