import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CalendarService } from './calendar.service';
import { LessonsMaterializerService } from './lessons-materializer.service';
import { LessonStatus, LessonTargetType } from '../../../_contracts/calendar';
import { GroupsService } from '../../groups/services/groups.service';
import { StudentsService } from '../../students/services/students.service';
import { UsersService } from '../../users/services/users.service';
import { LessonsRepository } from '../repositories/lessons.repository';
import { RecurringLessonsRepository } from '../repositories/recurring-lessons.repository';

describe('CalendarService', () => {
  let service: CalendarService;

  const TIMEZONE = 'Europe/Moscow'; // UTC+3

  const mockLessonsRepository = {
    createMany: jest.fn(),
    createOne: jest.fn(),
    findByRecurringLessonsAndStartAts: jest.fn(),
    findInDateRange: jest.fn(),
    findPaginated: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockRecurringLessonsRepository = {
    createMany: jest.fn(),
    findAllActive: jest.fn(),
    findActiveByTeacherAndDays: jest.fn(),
  };

  const mockUsersService = {
    getProfile: jest.fn().mockResolvedValue({
      timezone: TIMEZONE,
      bufferMinutesAfterLesson: 0,
    }),
    getWorkSchedule: jest.fn(),
  };

  const mockStudentsService = {
    getById: jest.fn(),
  };

  const mockGroupsService = {
    getById: jest.fn(),
  };

  const mockLessonsMaterializerService = {
    materializeForRecurringLessons: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        { provide: LessonsRepository, useValue: mockLessonsRepository },
        { provide: RecurringLessonsRepository, useValue: mockRecurringLessonsRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: LessonsMaterializerService, useValue: mockLessonsMaterializerService },
      ],
    }).compile();

    service = module.get(CalendarService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated lessons for student', async () => {
    const startAt = new Date('2030-03-25T06:00:00.000Z');

    mockLessonsRepository.findPaginated.mockResolvedValue({
      items: [
        {
          id: 'lesson-1',
          studentId: 'student-1',
          groupId: null,
          recurringLessonId: null,
          startAt,
          duration: 60,
          status: LessonStatus.COMPLETED,
          student: { firstName: 'Anna', lastName: 'Petrova' },
          group: null,
        },
      ],
      total: 1,
    });

    const result = await service.getLessons('teacher-1', { studentId: 'student-1' }, 1, 20);

    expect(result).toEqual({
      items: [
        expect.objectContaining({
          id: 'lesson-1',
          status: LessonStatus.COMPLETED,
          type: LessonTargetType.STUDENT,
        }),
      ],
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(mockLessonsRepository.findPaginated).toHaveBeenCalledWith(
      'teacher-1',
      { studentId: 'student-1' },
      1,
      20,
    );
  });

  it('should calculate available slots with teacher buffer', async () => {
    mockUsersService.getProfile.mockResolvedValue({
      timezone: TIMEZONE,
      bufferMinutesAfterLesson: 15,
    });
    mockUsersService.getWorkSchedule.mockResolvedValue([
      {
        dayOfWeek: 0,
        isWorkday: true,
        intervals: [{ startTime: '09:00', endTime: '13:00' }],
      },
    ]);
    // lesson at 10:00 Moscow = 07:00 UTC
    mockLessonsRepository.findInDateRange.mockResolvedValue([
      {
        startAt: new Date('2030-03-25T07:00:00.000Z'),
        duration: 60,
      },
    ]);

    const result = await service.getAvailableSlots('teacher-1', '2030-03-25', 60);

    // 09:00–10:00 заканчивается ровно в начале занятия — буферного зазора нет → недоступен
    expect(result).not.toContainEqual(
      expect.objectContaining({ date: '2030-03-25', startTime: '09:00' }),
    );
    // 11:15 — первый слот после занятия (10:00–11:00) + буфер 15 мин → доступен
    expect(result).toContainEqual(
      expect.objectContaining({ date: '2030-03-25', startTime: '11:15' }),
    );
    // 10:15 внутри занятия → недоступен
    expect(result).not.toContainEqual(
      expect.objectContaining({ date: '2030-03-25', startTime: '10:15' }),
    );
  });

  it('should reject lesson when slot is busy', async () => {
    mockStudentsService.getById.mockResolvedValue({
      id: 'student-1',
      firstName: 'Anna',
      lastName: null,
    });
    jest
      .spyOn(service, 'getAvailableSlots')
      .mockResolvedValue([{ date: '2030-03-25', dayOfWeek: 0, startTime: '09:00' }]);

    await expect(
      service.createLesson('teacher-1', {
        studentId: 'student-1',
        date: '2030-03-25',
        startTime: '10:00',
        duration: 60,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should update lesson status', async () => {
    const startAt = new Date('2030-03-25T06:00:00.000Z');

    mockLessonsRepository.updateStatus.mockResolvedValue({
      id: 'lesson-1',
      startAt,
      status: LessonStatus.COMPLETED,
    });
    mockLessonsRepository.findInDateRange.mockResolvedValue([
      {
        id: 'lesson-1',
        studentId: 'student-1',
        groupId: null,
        recurringLessonId: null,
        startAt,
        duration: 60,
        status: LessonStatus.COMPLETED,
        student: { firstName: 'Anna', lastName: null },
        group: null,
      },
    ]);

    const result = await service.updateLessonStatus('teacher-1', 'lesson-1', {
      status: LessonStatus.COMPLETED,
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'lesson-1',
        status: LessonStatus.COMPLETED,
        type: LessonTargetType.STUDENT,
        entityId: 'student-1',
      }),
    );
    expect(mockLessonsRepository.updateStatus).toHaveBeenCalledWith(
      'lesson-1',
      'teacher-1',
      LessonStatus.COMPLETED,
    );
  });

  it('should throw when updating status of non-existent lesson', async () => {
    mockLessonsRepository.updateStatus.mockResolvedValue(null);

    await expect(
      service.updateLessonStatus('teacher-1', 'unknown-lesson', {
        status: LessonStatus.CANCELLED,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should map week lessons into calendar response', async () => {
    // 09:00 Moscow = 06:00 UTC
    const startAt = new Date('2030-03-25T06:00:00.000Z');

    mockLessonsRepository.findInDateRange.mockResolvedValue([
      {
        id: 'lesson-1',
        studentId: 'student-1',
        groupId: null,
        recurringLessonId: 'recurring-1',
        startAt,
        duration: 60,
        status: LessonStatus.SCHEDULED,
        student: { firstName: 'Anna', lastName: 'Petrova' },
        group: null,
      },
    ]);

    const result = await service.getWeek('teacher-1', '2030-03-25');

    expect(result).toEqual([
      {
        id: 'lesson-1',
        type: LessonTargetType.STUDENT,
        entityId: 'student-1',
        title: 'Anna Petrova',
        startAt: startAt.toISOString(),
        duration: 60,
        status: LessonStatus.SCHEDULED,
        recurring: true,
      },
    ]);
  });
});
