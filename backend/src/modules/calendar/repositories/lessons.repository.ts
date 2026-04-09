import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, FindOptionsWhere, In, Repository } from 'typeorm';

import { LessonStatus } from '../../../_contracts/calendar';
import { LessonEntity } from '../dao/lesson.entity';

@Injectable()
export class LessonsRepository {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly repository: Repository<LessonEntity>,
  ) {}

  public async findInDateRange(
    teacherId: string,
    startAt: Date,
    endAt: Date,
  ): Promise<LessonEntity[]> {
    return this.repository.find({
      where: {
        teacherId,
        startAt: Between(startAt, endAt),
      },
      relations: {
        student: true,
        group: true,
      },
      order: {
        startAt: 'ASC',
      },
    });
  }

  public async findByRecurringLessonsAndStartAts(
    recurringLessonIds: string[],
    startAts: Date[],
  ): Promise<LessonEntity[]> {
    if (!recurringLessonIds.length || !startAts.length) {
      return [];
    }

    return this.repository.find({
      where: {
        recurringLessonId: In(recurringLessonIds),
        startAt: In(startAts),
      },
    });
  }

  public async createMany(data: DeepPartial<LessonEntity>[]): Promise<LessonEntity[]> {
    return this.repository.save(data);
  }

  public async createOne(data: DeepPartial<LessonEntity>): Promise<LessonEntity> {
    return this.repository.save(data);
  }

  public async countCompletedByStudent(teacherId: string, studentId: string): Promise<number> {
    return this.repository.count({
      where: { teacherId, studentId, status: LessonStatus.COMPLETED },
    });
  }

  public async findPaginated(
    teacherId: string,
    filter: { studentId?: string; groupId?: string },
    page: number,
    limit: number,
  ): Promise<{ items: LessonEntity[]; total: number }> {
    const where: FindOptionsWhere<LessonEntity> = { teacherId };

    if (filter.studentId) {
      where.studentId = filter.studentId;
    } else if (filter.groupId) {
      where.groupId = filter.groupId;
    }

    const [items, total] = await this.repository.findAndCount({
      where,
      relations: { student: true, group: true },
      order: { startAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  public async updateStatus(
    id: string,
    teacherId: string,
    status: LessonStatus,
  ): Promise<LessonEntity | null> {
    await this.repository.update({ id, teacherId }, { status });
    return this.repository.findOne({ where: { id, teacherId } });
  }
}
