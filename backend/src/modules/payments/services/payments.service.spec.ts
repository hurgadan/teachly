import { Test, TestingModule } from '@nestjs/testing';

import { PaymentsService } from './payments.service';
import { LessonsRepository } from '../../calendar/repositories/lessons.repository';
import { StudentsService } from '../../students/services/students.service';
import { PaymentsRepository } from '../repositories/payments.repository';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPaymentsRepository = {
    createOne: jest.fn(),
    findPaginated: jest.fn(),
    sumByStudent: jest.fn(),
    sumLessonsCountByStudent: jest.fn(),
  };

  const mockLessonsRepository = {
    countCompletedByStudent: jest.fn(),
  };

  const mockStudentsService = {
    getById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockPaymentsRepository },
        { provide: LessonsRepository, useValue: mockLessonsRepository },
        { provide: StudentsService, useValue: mockStudentsService },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create payment for student and calculate amount from price', async () => {
    mockStudentsService.getById.mockResolvedValue({ id: 'student-1', price: 1500 });
    mockPaymentsRepository.createOne.mockResolvedValue({
      id: 'payment-1',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      groupId: null,
      amount: 3000,
      lessonsCount: 2,
      type: 'prepaid',
      comment: 'April lesson',
      createdAt: new Date('2026-04-06T10:00:00.000Z'),
    });

    const result = await service.create('teacher-1', {
      studentId: 'student-1',
      lessonsCount: 2,
      type: 'prepaid',
      comment: 'April lesson',
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'payment-1',
        studentId: 'student-1',
        amount: 3000,
        lessonsCount: 2,
        type: 'prepaid',
      }),
    );
    expect(mockStudentsService.getById).toHaveBeenCalledWith('teacher-1', 'student-1');
    expect(mockPaymentsRepository.createOne).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 3000, lessonsCount: 2, type: 'prepaid' }),
    );
  });

  it('should calculate student balance with isOverdue for prepaid', async () => {
    mockStudentsService.getById.mockResolvedValue({
      id: 'student-1',
      price: 2000,
      paymentType: 'prepaid',
      paymentThresholdLessons: 12,
    });
    mockPaymentsRepository.sumByStudent.mockResolvedValue(6000);
    mockPaymentsRepository.sumLessonsCountByStudent.mockResolvedValue(3);
    mockLessonsRepository.countCompletedByStudent.mockResolvedValue(4);

    const result = await service.getStudentBalance('teacher-1', 'student-1');

    expect(result).toEqual({
      studentId: 'student-1',
      totalPaid: 6000,
      totalCharged: 8000,
      balance: -2000,
      paidLessonsCount: 3,
      unpaidLessons: 1,
      isOverdue: true,
    });
  });

  it('should not be overdue for postpaid below threshold', async () => {
    mockStudentsService.getById.mockResolvedValue({
      id: 'student-1',
      price: 2000,
      paymentType: 'postpaid',
      paymentThresholdLessons: 12,
    });
    mockPaymentsRepository.sumByStudent.mockResolvedValue(0);
    mockPaymentsRepository.sumLessonsCountByStudent.mockResolvedValue(0);
    mockLessonsRepository.countCompletedByStudent.mockResolvedValue(5);

    const result = await service.getStudentBalance('teacher-1', 'student-1');

    expect(result.unpaidLessons).toBe(5);
    expect(result.isOverdue).toBe(false);
  });

  it('should be overdue for postpaid at or above threshold', async () => {
    mockStudentsService.getById.mockResolvedValue({
      id: 'student-1',
      price: 2000,
      paymentType: 'postpaid',
      paymentThresholdLessons: 12,
    });
    mockPaymentsRepository.sumByStudent.mockResolvedValue(0);
    mockPaymentsRepository.sumLessonsCountByStudent.mockResolvedValue(0);
    mockLessonsRepository.countCompletedByStudent.mockResolvedValue(12);

    const result = await service.getStudentBalance('teacher-1', 'student-1');

    expect(result.unpaidLessons).toBe(12);
    expect(result.isOverdue).toBe(true);
  });

  it('should return paginated payments', async () => {
    mockPaymentsRepository.findPaginated.mockResolvedValue({
      items: [
        {
          id: 'payment-1',
          teacherId: 'teacher-1',
          studentId: 'student-1',
          groupId: null,
          amount: 2000,
          lessonsCount: 1,
          type: 'prepaid',
          comment: null,
          createdAt: new Date('2026-04-06T10:00:00.000Z'),
        },
      ],
      total: 1,
    });

    const result = await service.findMany('teacher-1', { studentId: 'student-1' }, 1, 20);

    expect(result).toEqual(
      expect.objectContaining({
        total: 1,
        page: 1,
        limit: 20,
        items: [expect.objectContaining({ id: 'payment-1', amount: 2000 })],
      }),
    );
  });
});
