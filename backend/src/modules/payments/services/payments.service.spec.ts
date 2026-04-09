import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PaymentsService } from './payments.service';
import { LessonsRepository } from '../../calendar/repositories/lessons.repository';
import { GroupsService } from '../../groups/services/groups.service';
import { StudentsService } from '../../students/services/students.service';
import { PaymentsRepository } from '../repositories/payments.repository';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPaymentsRepository = {
    createOne: jest.fn(),
    findPaginated: jest.fn(),
    sumByStudent: jest.fn(),
  };

  const mockLessonsRepository = {
    countCompletedByStudent: jest.fn(),
  };

  const mockStudentsService = {
    getById: jest.fn(),
  };

  const mockGroupsService = {
    getById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockPaymentsRepository },
        { provide: LessonsRepository, useValue: mockLessonsRepository },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: GroupsService, useValue: mockGroupsService },
      ],
    }).compile();

    service = module.get(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create payment for student', async () => {
    mockStudentsService.getById.mockResolvedValue({ id: 'student-1' });
    mockPaymentsRepository.createOne.mockResolvedValue({
      id: 'payment-1',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      groupId: null,
      amount: 1500,
      comment: 'April lesson',
      createdAt: new Date('2026-04-06T10:00:00.000Z'),
    });

    const result = await service.create('teacher-1', {
      studentId: 'student-1',
      amount: 1500,
      comment: 'April lesson',
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'payment-1',
        studentId: 'student-1',
        amount: 1500,
      }),
    );
    expect(mockStudentsService.getById).toHaveBeenCalledWith('teacher-1', 'student-1');
  });

  it('should throw when both studentId and groupId provided', async () => {
    await expect(
      service.create('teacher-1', { studentId: 'student-1', groupId: 'group-1', amount: 1000 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw when neither studentId nor groupId provided', async () => {
    await expect(service.create('teacher-1', { amount: 1000 })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should calculate student balance', async () => {
    mockStudentsService.getById.mockResolvedValue({ id: 'student-1', price: 2000 });
    mockPaymentsRepository.sumByStudent.mockResolvedValue(6000);
    mockLessonsRepository.countCompletedByStudent.mockResolvedValue(2);

    const result = await service.getStudentBalance('teacher-1', 'student-1');

    expect(result).toEqual({
      studentId: 'student-1',
      totalPaid: 6000,
      totalCharged: 4000,
      balance: 2000,
    });
  });

  it('should return negative balance when student owes money', async () => {
    mockStudentsService.getById.mockResolvedValue({ id: 'student-1', price: 2000 });
    mockPaymentsRepository.sumByStudent.mockResolvedValue(2000);
    mockLessonsRepository.countCompletedByStudent.mockResolvedValue(3);

    const result = await service.getStudentBalance('teacher-1', 'student-1');

    expect(result.balance).toBe(-4000);
    expect(result.totalCharged).toBe(6000);
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
