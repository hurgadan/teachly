import { BadRequestException, Injectable } from '@nestjs/common';

import { CreatePayment, PaginatedResponse, Payment, StudentBalance } from '../../../_contracts';
import { LessonsRepository } from '../../calendar/repositories/lessons.repository';
import { GroupsService } from '../../groups/services/groups.service';
import { StudentsService } from '../../students/services/students.service';
import { PaymentEntity } from '../dao/payment.entity';
import { PaymentsRepository } from '../repositories/payments.repository';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly lessonsRepository: LessonsRepository,
    private readonly studentsService: StudentsService,
    private readonly groupsService: GroupsService,
  ) {}

  public async create(teacherId: string, data: CreatePayment): Promise<Payment> {
    if ((data.studentId && data.groupId) || (!data.studentId && !data.groupId)) {
      throw new BadRequestException('Exactly one target (studentId or groupId) is required');
    }

    if (data.studentId) {
      await this.studentsService.getById(teacherId, data.studentId);
    } else {
      await this.groupsService.getById(teacherId, data.groupId!);
    }

    const payment = await this.paymentsRepository.createOne({
      teacherId,
      studentId: data.studentId ?? null,
      groupId: data.groupId ?? null,
      amount: data.amount,
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

    const [totalPaid, completedCount] = await Promise.all([
      this.paymentsRepository.sumByStudent(teacherId, studentId),
      this.lessonsRepository.countCompletedByStudent(teacherId, studentId),
    ]);

    const totalCharged = completedCount * student.price;

    return {
      studentId,
      totalPaid,
      totalCharged,
      balance: totalPaid - totalCharged,
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
    comment: payment.comment,
    createdAt: payment.createdAt.toISOString(),
  };
}
