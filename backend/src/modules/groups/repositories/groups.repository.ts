import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';

import { GroupEntity } from '../dao/group.entity';

@Injectable()
export class GroupsRepository {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly repository: Repository<GroupEntity>,
  ) {}

  public async findAllByTeacherId(teacherId: string): Promise<GroupEntity[]> {
    return this.repository.find({
      where: { teacherId },
      relations: {
        members: {
          student: true,
        },
      },
      order: {
        createdAt: 'DESC',
        members: {
          id: 'ASC',
        },
      },
    });
  }

  public async findOneByIdAndTeacherId(id: string, teacherId: string): Promise<GroupEntity | null> {
    return this.repository.findOne({
      where: { id, teacherId },
      relations: {
        members: {
          student: true,
        },
      },
      order: {
        members: {
          id: 'ASC',
        },
      },
    });
  }

  public async create(data: DeepPartial<GroupEntity>): Promise<GroupEntity> {
    return this.repository.save(data);
  }

  public async update(id: string, teacherId: string, data: Partial<GroupEntity>): Promise<void> {
    await this.repository.update({ id, teacherId }, data);
  }
}
