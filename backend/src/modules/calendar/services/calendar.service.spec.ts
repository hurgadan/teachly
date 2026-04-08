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
        startAt: new Date('2026-04-06T07:00:00.000Z'),
        duration: 60,
      },
    ]);

    const result = await service.getAvailableSlots('teacher-1', '2026-04-06', 60);

    expect(result).toContainEqual(
      expect.objectContaining({ date: '2026-04-06', startTime: '09:00' }),
    );
    expect(result).toContainEqual(
      expect.objectContaining({ date: '2026-04-06', startTime: '11:15' }),
    );
    expect(result).not.toContainEqual(
      expect.objectContaining({ date: '2026-04-06', startTime: '10:15' }),
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
      .mockResolvedValue([{ date: '2026-04-06', dayOfWeek: 0, startTime: '09:00' }]);

    await expect(
      service.createLesson('teacher-1', {
        studentId: 'student-1',
        date: '2026-04-06',
        startTime: '10:00',
        duration: 60,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should map week lessons into calendar response', async () => {
    // 09:00 Moscow = 06:00 UTC
    const startAt = new Date('2026-04-06T06:00:00.000Z');

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

    const result = await service.getWeek('teacher-1', '2026-04-06');

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
