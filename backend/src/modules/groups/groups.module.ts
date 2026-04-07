import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentsModule } from '../students/students.module';
import { GroupsController } from './controllers/groups.controller';
import { GroupMemberEntity } from './dao/group-member.entity';
import { GroupEntity } from './dao/group.entity';
import { GroupMembersRepository } from './repositories/group-members.repository';
import { GroupsRepository } from './repositories/groups.repository';
import { GroupsService } from './services/groups.service';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity, GroupMemberEntity]), StudentsModule],
  controllers: [GroupsController],
  providers: [GroupMembersRepository, GroupsRepository, GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
