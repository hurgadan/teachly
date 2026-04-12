import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, FindOptionsWhere, In, MoreThanOrEqual, Repository } from 'typeorm';

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

  public async countCompletedByStudents(
    teacherId: string,
  ): Promise<{ studentId: string; total: number }[]> {
    const rows = await this.repository
      .createQueryBuilder('l')
      .select('l.student_id', 'studentId')
      .addSelect('COUNT(*)', 'total')
      .where('l.teacher_id = :teacherId', { teacherId })
      .andWhere('l.status = :status', { status: LessonStatus.COMPLETED })
      .andWhere('l.student_id IS NOT NULL')
      .groupBy('l.student_id')
      .getRawMany<{ studentId: string; total: string }>();

    return rows.map((r) => ({ studentId: r.studentId, total: Number(r.total) }));
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

  public async findById(id: string, teacherId: string): Promise<LessonEntity | null> {
    return this.repository.findOne({ where: { id, teacherId } });
  }

  public async updateStatus(
    id: string,
    teacherId: string,
    status: LessonStatus,
  ): Promise<LessonEntity | null> {
    await this.repository.update({ id, teacherId }, { status });
    return this.repository.findOne({ where: { id, teacherId } });
  }

  public async updateStartAt(
    id: string,
    teacherId: string,
    startAt: Date,
  ): Promise<LessonEntity | null> {
    await this.repository.update({ id, teacherId }, { startAt, status: LessonStatus.RESCHEDULED });
    return this.repository.findOne({ where: { id, teacherId } });
  }

  public async cancelFutureByRecurringId(recurringLessonId: string, from: Date): Promise<void> {
    await this.repository.update(
      {
        recurringLessonId,
        status: In([LessonStatus.SCHEDULED, LessonStatus.RESCHEDULED]),
        startAt: MoreThanOrEqual(from),
      },
      { status: LessonStatus.CANCELLED },
    );
  }
}
