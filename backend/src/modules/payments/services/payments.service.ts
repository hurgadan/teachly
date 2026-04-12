import { Injectable, NotFoundException } from '@nestjs/common';

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

  public async delete(teacherId: string, id: string): Promise<void> {
    const deleted = await this.paymentsRepository.deleteOne(id, teacherId);
    if (!deleted) {
      throw new NotFoundException('Payment not found');
    }
  }

  public async getStudentsBalances(teacherId: string): Promise<StudentBalance[]> {
    const students = await this.studentsService.findAll(teacherId);

    if (!students.length) return [];

    const [paidAmounts, paidLessonsCounts, completedCounts] = await Promise.all([
      this.paymentsRepository.sumAmountByStudents(teacherId),
      this.paymentsRepository.sumLessonsCountByStudents(teacherId),
      this.lessonsRepository.countCompletedByStudents(teacherId),
    ]);

    const paidAmountMap = new Map(paidAmounts.map((r) => [r.studentId, r.total]));
    const paidLessonsMap = new Map(paidLessonsCounts.map((r) => [r.studentId, r.total]));
    const completedMap = new Map(completedCounts.map((r) => [r.studentId, r.total]));

    return students.map((student) => {
      const totalPaid = paidAmountMap.get(student.id) ?? 0;
      const paidLessonsCount = paidLessonsMap.get(student.id) ?? 0;
      const completedCount = completedMap.get(student.id) ?? 0;
      const totalCharged = completedCount * student.price;
      const unpaidLessons = Math.max(0, completedCount - paidLessonsCount);
      const isOverdue =
        student.paymentType === 'prepaid'
          ? unpaidLessons > 0
          : unpaidLessons >= student.paymentThresholdLessons;

      return {
        studentId: student.id,
        totalPaid,
        totalCharged,
        balance: totalPaid - totalCharged,
        paidLessonsCount,
        unpaidLessons,
        isOverdue,
      };
    });
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
