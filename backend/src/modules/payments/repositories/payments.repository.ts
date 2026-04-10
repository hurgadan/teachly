import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { PaymentEntity } from '../dao/payment.entity';

@Injectable()
export class PaymentsRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repository: Repository<PaymentEntity>,
  ) {}

  public async createOne(data: DeepPartial<PaymentEntity>): Promise<PaymentEntity> {
    return this.repository.save(data);
  }

  public async findPaginated(
    teacherId: string,
    filter: { studentId?: string; groupId?: string },
    page: number,
    limit: number,
  ): Promise<{ items: PaymentEntity[]; total: number }> {
    const where: FindOptionsWhere<PaymentEntity> = { teacherId };

    if (filter.studentId) {
      where.studentId = filter.studentId;
    } else if (filter.groupId) {
      where.groupId = filter.groupId;
    }

    const [items, total] = await this.repository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  public async sumByStudent(teacherId: string, studentId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.teacher_id = :teacherId', { teacherId })
      .andWhere('p.student_id = :studentId', { studentId })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  public async sumLessonsCountByStudent(teacherId: string, studentId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.lessons_count), 0)', 'total')
      .where('p.teacher_id = :teacherId', { teacherId })
      .andWhere('p.student_id = :studentId', { studentId })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }
}
