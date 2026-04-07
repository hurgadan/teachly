import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';

import { RecurringLessonEntity } from '../dao/recurring-lesson.entity';

@Injectable()
export class RecurringLessonsRepository {
  constructor(
    @InjectRepository(RecurringLessonEntity)
    private readonly repository: Repository<RecurringLessonEntity>,
  ) {}

  public async createMany(
    data: DeepPartial<RecurringLessonEntity>[],
  ): Promise<RecurringLessonEntity[]> {
    return this.repository.save(data);
  }

  public async findActiveByTeacherAndDays(
    teacherId: string,
    dayOfWeeks: number[],
  ): Promise<RecurringLessonEntity[]> {
    if (!dayOfWeeks.length) {
      return [];
    }

    return this.repository.find({
      where: {
        teacherId,
        dayOfWeek: In(dayOfWeeks),
        isActive: true,
      },
      relations: {
        student: true,
        group: true,
      },
      order: {
        dayOfWeek: 'ASC',
        startTime: 'ASC',
      },
    });
  }
}
