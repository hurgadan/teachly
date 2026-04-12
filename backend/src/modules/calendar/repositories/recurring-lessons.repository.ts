import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, IsNull, MoreThan, Repository } from 'typeorm';

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

  public async findAllActive(): Promise<RecurringLessonEntity[]> {
    return this.repository.find({
      where: [{ cancelledFrom: IsNull() }, { cancelledFrom: MoreThan(new Date()) }],
    });
  }

  public async findActiveByTeacherAndDays(
    teacherId: string,
    dayOfWeeks: number[],
  ): Promise<RecurringLessonEntity[]> {
    if (!dayOfWeeks.length) {
      return [];
    }

    return this.repository.find({
      where: [
        { teacherId, dayOfWeek: In(dayOfWeeks), cancelledFrom: IsNull() },
        { teacherId, dayOfWeek: In(dayOfWeeks), cancelledFrom: MoreThan(new Date()) },
      ],
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

  public async findById(id: string): Promise<RecurringLessonEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  public async cancelFrom(id: string, date: Date): Promise<void> {
    await this.repository.update(id, { cancelledFrom: date });
  }
}
