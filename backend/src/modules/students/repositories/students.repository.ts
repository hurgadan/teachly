import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, ILike, In, Repository } from 'typeorm';

import { StudentEntity } from '../dao/student.entity';

interface StudentFilter {
  id?: string;
  ids?: string[];
  teacherId: string;
}

@Injectable()
export class StudentsRepository {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repository: Repository<StudentEntity>,
  ) {}

  public async findAllByTeacherId(teacherId: string, search?: string): Promise<StudentEntity[]> {
    const where: FindOptionsWhere<StudentEntity>[] = search
      ? [
          { teacherId, firstName: ILike(`%${search}%`) },
          { teacherId, lastName: ILike(`%${search}%`) },
          { teacherId, email: ILike(`%${search}%`) },
        ]
      : [{ teacherId }];

    return this.repository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async findOne(filter: StudentFilter): Promise<StudentEntity | null> {
    return this.repository.findOne({
      where: this.toWhere(filter),
    });
  }

  public async findMany(filter: StudentFilter): Promise<StudentEntity[]> {
    return this.repository.find({
      where: this.toWhere(filter),
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async create(data: DeepPartial<StudentEntity>): Promise<StudentEntity> {
    return this.repository.save(data);
  }

  public async update(id: string, teacherId: string, data: Partial<StudentEntity>): Promise<void> {
    await this.repository.update({ id, teacherId }, data);
  }

  private toWhere(filter: StudentFilter): FindOptionsWhere<StudentEntity> {
    const where: FindOptionsWhere<StudentEntity> = {
      teacherId: filter.teacherId,
    };

    if (filter.id) {
      where.id = filter.id;
    }

    if (filter.ids?.length) {
      where.id = In(filter.ids);
    }

    return where;
  }
}
