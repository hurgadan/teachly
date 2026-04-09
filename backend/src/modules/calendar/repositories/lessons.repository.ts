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
}
