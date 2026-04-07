import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { StudentsService } from '../../students/services/students.service';
import { GroupEntity } from '../dao/group.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupMembersRepository } from '../repositories/group-members.repository';
import { GroupsRepository } from '../repositories/groups.repository';

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly groupMembersRepository: GroupMembersRepository,
    private readonly studentsService: StudentsService,
  ) {}

  public async create(teacherId: string, data: CreateGroupDto): Promise<GroupEntity> {
    await this.ensureStudentsBelongToTeacher(teacherId, data.studentIds);

    const group = await this.groupsRepository.create({
      teacherId,
      name: data.name.trim(),
      duration: data.duration,
    });

    await this.groupMembersRepository.replaceForGroup(group.id, data.studentIds);

    return this.getById(teacherId, group.id);
  }

  public async findAll(teacherId: string): Promise<GroupEntity[]> {
    return this.groupsRepository.findAllByTeacherId(teacherId);
  }

  public async getById(teacherId: string, id: string): Promise<GroupEntity> {
    const group = await this.groupsRepository.findOneByIdAndTeacherId(id, teacherId);

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  public async update(teacherId: string, id: string, data: UpdateGroupDto): Promise<GroupEntity> {
    await this.getById(teacherId, id);

    if (data.studentIds !== undefined) {
      await this.ensureStudentsBelongToTeacher(teacherId, data.studentIds);
      await this.groupMembersRepository.replaceForGroup(id, data.studentIds);
    }

    await this.groupsRepository.update(id, teacherId, {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.duration !== undefined ? { duration: data.duration } : {}),
    });

    return this.getById(teacherId, id);
  }

  private async ensureStudentsBelongToTeacher(
    teacherId: string,
    studentIds: string[],
  ): Promise<void> {
    const uniqueStudentIds = [...new Set(studentIds)];
    const students = await this.studentsService.getByIds(teacherId, uniqueStudentIds);

    if (students.length !== uniqueStudentIds.length) {
      throw new BadRequestException('One or more students do not belong to the teacher');
    }
  }
}
