import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, In, Repository } from 'typeorm';

import { LessonEntity } from '../dao/lesson.entity';

@Injectable()
export class LessonsRepository {
  constructor(
    @InjectRepository(LessonEntity)
    private readonly repository: Repository<LessonEntity>,
  ) {}

  public async findInDateRange(
    teacherId: string,
    startDate: string,
    endDate: string,
  ): Promise<LessonEntity[]> {
    return this.repository.find({
      where: {
        teacherId,
        date: Between(startDate, endDate),
      },
      relations: {
        student: true,
        group: true,
      },
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  public async findByRecurringLessonsAndDates(
    recurringLessonIds: string[],
    dates: string[],
  ): Promise<LessonEntity[]> {
    if (!recurringLessonIds.length || !dates.length) {
      return [];
    }

    return this.repository.find({
      where: {
        recurringLessonId: In(recurringLessonIds),
        date: In(dates),
      },
    });
  }

  public async createMany(data: DeepPartial<LessonEntity>[]): Promise<LessonEntity[]> {
    return this.repository.save(data);
  }

  public async createOne(data: DeepPartial<LessonEntity>): Promise<LessonEntity> {
    return this.repository.save(data);
  }
}
