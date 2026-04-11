import { Injectable } from '@nestjs/common';

import {
  CreatePayment,
  PaginatedResponse,
  Payment,
  PaymentType,
  StudentBalance,
} from '../../../_contracts';
import { LessonsRepository } from '../../calendar/repositories/lessons.repository';
import { StudentsService } from '../../students/services/students.service';
import { PaymentEntity } from '../dao/payment.entity';
import { PaymentsRepository } from '../repositories/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly lessonsRepository: LessonsRepository,
    private readonly studentsService: StudentsService,
  ) {}

  public async create(teacherId: string, data: CreatePayment): Promise<Payment> {
    const student = await this.studentsService.getById(teacherId, data.studentId);
    const amount = data.lessonsCount * student.price;

    const payment = await this.paymentsRepository.createOne({
      teacherId,
      studentId: data.studentId,
      groupId: null,
      amount,
      lessonsCount: data.lessonsCount,
      type: data.type,
      comment: data.comment ?? null,
    });

    return mapEntityToPayment(payment);
  }

  public async findMany(
    teacherId: string,
    filter: { studentId?: string; groupId?: string },
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Payment>> {
    const { items, total } = await this.paymentsRepository.findPaginated(
      teacherId,
      filter,
      page,
      limit,
    );

    return {
      items: items.map(mapEntityToPayment),
      total,
      page,
      limit,
    };
  }

  public async getStudentBalance(teacherId: string, studentId: string): Promise<StudentBalance> {
    const student = await this.studentsService.getById(teacherId, studentId);

    const [totalPaid, paidLessonsCount, completedCount] = await Promise.all([
      this.paymentsRepository.sumByStudent(teacherId, studentId),
      this.paymentsRepository.sumLessonsCountByStudent(teacherId, studentId),
      this.lessonsRepository.countCompletedByStudent(teacherId, studentId),
    ]);

    const totalCharged = completedCount * student.price;
    const unpaidLessons = Math.max(0, completedCount - paidLessonsCount);

    const isOverdue =
      student.paymentType === 'prepaid'
        ? unpaidLessons > 0
        : unpaidLessons >= student.paymentThresholdLessons;

    return {
      studentId,
      totalPaid,
      totalCharged,
      balance: totalPaid - totalCharged,
      paidLessonsCount,
      unpaidLessons,
      isOverdue,
    };
  }
}

function mapEntityToPayment(payment: PaymentEntity): Payment {
  return {
    id: payment.id,
    teacherId: payment.teacherId,
    studentId: payment.studentId,
    groupId: payment.groupId,
    amount: payment.amount,
    lessonsCount: payment.lessonsCount,
    type: payment.type as PaymentType,
    comment: payment.comment,
    createdAt: payment.createdAt.toISOString(),
  };
}
