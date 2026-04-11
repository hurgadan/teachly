import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkScheduleEntity } from '../dao/work-schedule.entity';

@Injectable()
export class WorkScheduleRepository {
  constructor(
    @InjectRepository(WorkScheduleEntity)
    private readonly repository: Repository<WorkScheduleEntity>,
  ) {}

  async findByTeacherId(teacherId: string): Promise<WorkScheduleEntity[]> {
    return this.repository.find({
      where: { teacherId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  async upsertMany(
    teacherId: string,
    items: Partial<WorkScheduleEntity>[],
  ): Promise<WorkScheduleEntity[]> {
    const existing = await this.findByTeacherId(teacherId);
    const existingByDay = new Map(existing.map((e) => [e.dayOfWeek, e.id]));

    const entities = items.map((item) =>
      this.repository.create({
        ...item,
        teacherId,
        id: existingByDay.get(item.dayOfWeek!),
      }),
    );

    return this.repository.save(entities);
  }
}
