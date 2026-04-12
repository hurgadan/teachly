import { BadRequestException, Injectable } from '@nestjs/common';

import { LessonsMaterializerService } from './lessons-materializer.service';
import { localToUtc, utcToLocal } from '../../../_common/utils/timezone';
import { PaginatedResponse } from '../../../_contracts';
import {
  AvailableSlot,
  CreateLesson,
  CreateRecurringLesson,
  Lesson,
  LessonStatus,
  LessonTargetType,
  UpdateLessonStatus,
} from '../../../_contracts/calendar';
import { GroupsService } from '../../groups/services/groups.service';
import { StudentsService } from '../../students/services/students.service';
import { UsersService } from '../../users/services/users.service';
import { CALENDAR_SLOT_STEP_MINUTES } from '../constants';
import { LessonEntity } from '../dao/lesson.entity';
import { LessonsRepository } from '../repositories/lessons.repository';
import { RecurringLessonsRepository } from '../repositories/recurring-lessons.repository';

interface LessonTarget {
  type: LessonTargetType;
  entityId: string;
  title: string;
}

@Injectable()
export class CalendarService {
  constructor(
    private readonly lessonsRepository: LessonsRepository,
    private readonly recurringLessonsRepository: RecurringLessonsRepository,
    private readonly usersService: UsersService,
    private readonly studentsService: StudentsService,
    private readonly groupsService: GroupsService,
    private readonly lessonsMaterializerService: LessonsMaterializerService,
  ) {}

  public async getWeek(teacherId: string, startDate?: string): Promise<Lesson[]> {
    const profile = await this.usersService.getProfile(teacherId);
    const { startAt, endAt } = getWeekUtcRange(startDate, profile.timezone);

    const lessons = await this.lessonsRepository.findInDateRange(teacherId, startAt, endAt);
    return lessons.map(mapEntityToLesson);
  }

  public async getAvailableSlots(
    teacherId: string,
    startDate: string,
    duration: number,
  ): Promise<AvailableSlot[]> {
    const [profile, workSchedule] = await Promise.all([
      this.usersService.getProfile(teacherId),
      this.usersService.getWorkSchedule(teacherId),
    ]);

    const { startAt, endAt, weekDays } = getWeekUtcRange(startDate, profile.timezone);

    const lessons = await this.lessonsRepository.findInDateRange(teacherId, startAt, endAt);

    const slots: AvailableSlot[] = [];

    for (const weekDay of weekDays) {
      const daySchedule = workSchedule.find((item) => item.dayOfWeek === weekDay.dayOfWeek);

      if (!daySchedule?.isWorkday) {
        continue;
      }

      const dayLessons = lessons.filter((lesson) => {
        const { dateStr } = utcToLocal(lesson.startAt, profile.timezone);
        return dateStr === weekDay.date;
      });

      const occupied = dayLessons.map((lesson) => {
        const { minutes } = utcToLocal(lesson.startAt, profile.timezone);
        return {
          start: minutes - profile.bufferMinutesAfterLesson,
          end: minutes + lesson.duration + profile.bufferMinutesAfterLesson,
        };
      });

      for (const interval of daySchedule.intervals) {
        const intervalStart = timeToMinutes(interval.startTime);
        const intervalEnd = timeToMinutes(interval.endTime);

        const now = new Date();

        for (
          let cursor = intervalStart;
          cursor + duration <= intervalEnd;
          cursor += CALENDAR_SLOT_STEP_MINUTES
        ) {
          const slotEnd = cursor + duration;
          const isConflict = occupied.some((range) => cursor < range.end && slotEnd > range.start);
          const slotStartAt = localToUtc(weekDay.date, minutesToTime(cursor), profile.timezone);

          if (!isConflict && slotStartAt > now) {
            slots.push({
              date: weekDay.date,
              dayOfWeek: weekDay.dayOfWeek,
              startTime: minutesToTime(cursor),
            });
          }
        }
      }
    }

    return slots;
  }

  public async createRecurringLesson(
    teacherId: string,
    data: CreateRecurringLesson,
  ): Promise<Lesson[]> {
    const [target, profile] = await Promise.all([
      this.resolveTarget(teacherId, { studentId: data.studentId, groupId: data.groupId }),
      this.usersService.getProfile(teacherId),
    ]);

    const uniqueSlots = uniqueRecurringLessonSlots(data.slots);

    if (!uniqueSlots.length) {
      throw new BadRequestException('At least one slot is required');
    }

    const recurringLessons = await this.recurringLessonsRepository.createMany(
      uniqueSlots.map((slot) => ({
        teacherId,
        studentId: target.type === LessonTargetType.STUDENT ? target.entityId : null,
        groupId: target.type === LessonTargetType.GROUP ? target.entityId : null,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        duration: data.duration,
        isActive: true,
      })),
    );

    await this.lessonsMaterializerService.materializeForRecurringLessons(recurringLessons);

    const dates = uniqueSlots.map((slot) => slot.date);
    const slotStartAts = uniqueSlots.map((slot, i) =>
      localToUtc(slot.date, recurringLessons[i].startTime, profile.timezone),
    );

    const allLessons = await this.lessonsRepository.findInDateRange(
      teacherId,
      new Date(Math.min(...slotStartAts.map((d) => d.getTime()))),
      new Date(Math.max(...slotStartAts.map((d) => d.getTime()))),
    );

    return allLessons
      .filter((lesson) => {
        const { dateStr } = utcToLocal(lesson.startAt, profile.timezone);
        return (
          lesson.studentId ===
            (target.type === LessonTargetType.STUDENT ? target.entityId : null) &&
          lesson.groupId === (target.type === LessonTargetType.GROUP ? target.entityId : null) &&
          dates.includes(dateStr)
        );
      })
      .map(mapEntityToLesson);
  }

  public async createLesson(teacherId: string, data: CreateLesson): Promise<Lesson> {
    const [target, profile] = await Promise.all([
      this.resolveTarget(teacherId, { studentId: data.studentId, groupId: data.groupId }),
      this.usersService.getProfile(teacherId),
    ]);

    const startAt = localToUtc(data.date, data.startTime, profile.timezone);

    if (startAt <= new Date()) {
      throw new BadRequestException('Cannot create a lesson in the past');
    }

    const availableSlots = await this.getAvailableSlots(teacherId, data.date, data.duration);
    const isAvailable = availableSlots.some(
      (slot) => slot.date === data.date && slot.startTime === data.startTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Selected slot is not available');
    }

    const lesson = await this.lessonsRepository.createOne({
      teacherId,
      studentId: target.type === LessonTargetType.STUDENT ? target.entityId : null,
      groupId: target.type === LessonTargetType.GROUP ? target.entityId : null,
      recurringLessonId: null,
      startAt,
      duration: data.duration,
      status: LessonStatus.SCHEDULED,
    });

    const [createdLesson] = await this.lessonsRepository.findInDateRange(
      teacherId,
      lesson.startAt,
      lesson.startAt,
    );

    return mapEntityToLesson(createdLesson);
  }

  public async getLessons(
    teacherId: string,
    filter: { studentId?: string; groupId?: string },
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Lesson>> {
    const { items, total } = await this.lessonsRepository.findPaginated(
      teacherId,
      filter,
      page,
      limit,
    );

    return {
      items: items.map(mapEntityToLesson),
      total,
      page,
      limit,
    };
  }

  public async updateLessonStatus(
    teacherId: string,
    lessonId: string,
    data: UpdateLessonStatus,
  ): Promise<Lesson> {
    const lesson = await this.lessonsRepository.updateStatus(lessonId, teacherId, data.status);

    if (!lesson) {
      throw new BadRequestException('Lesson not found');
    }

    const [lessonWithRelations] = await this.lessonsRepository.findInDateRange(
      teacherId,
      lesson.startAt,
      lesson.startAt,
    );

    return mapEntityToLesson(lessonWithRelations);
  }

  public async recalculateTimezone(
    teacherId: string,
    oldTimezone: string,
    newTimezone: string,
  ): Promise<void> {
    const now = new Date();
    const farFuture = new Date('2100-01-01T00:00:00.000Z');

    const futureLessons = await this.lessonsRepository.findInDateRange(teacherId, now, farFuture);

    const scheduledLessons = futureLessons.filter(
      (lesson) => lesson.status === LessonStatus.SCHEDULED,
    );

    if (!scheduledLessons.length) {
      return;
    }

    const updated = scheduledLessons.map((lesson) => {
      const { dateStr, minutes } = utcToLocal(lesson.startAt, oldTimezone);
      const timeStr = minutesToTime(minutes);
      return {
        ...lesson,
        startAt: localToUtc(dateStr, timeStr, newTimezone),
      };
    });

    await this.lessonsRepository.createMany(updated);
  }

  private async resolveTarget(
    teacherId: string,
    data: { studentId?: string | null; groupId?: string | null },
  ): Promise<LessonTarget> {
    if ((data.studentId && data.groupId) || (!data.studentId && !data.groupId)) {
      throw new BadRequestException('Exactly one target is required');
    }

    if (data.studentId) {
      const student = await this.studentsService.getById(teacherId, data.studentId);
      return {
        type: LessonTargetType.STUDENT,
        entityId: student.id,
        title: [student.firstName, student.lastName].filter(Boolean).join(' '),
      };
    }

    const group = await this.groupsService.getById(teacherId, data.groupId!);
    return {
      type: LessonTargetType.GROUP,
      entityId: group.id,
      title: group.name,
    };
  }
}

function mapEntityToLesson(lesson: LessonEntity): Lesson {
  const isStudent = !!lesson.studentId;

  return {
    id: lesson.id,
    type: isStudent ? LessonTargetType.STUDENT : LessonTargetType.GROUP,
    entityId: isStudent ? lesson.studentId! : lesson.groupId!,
    title: isStudent
      ? [lesson.student?.firstName, lesson.student?.lastName].filter(Boolean).join(' ')
      : lesson.group?.name || '',
    startAt: lesson.startAt.toISOString(),
    duration: lesson.duration,
    status: lesson.status,
    recurring: !!lesson.recurringLessonId,
  };
}

function getWeekUtcRange(
  startDate: string | undefined,
  timezone: string,
): { startAt: Date; endAt: Date; weekDays: { date: string; dayOfWeek: number }[] } {
  const monday = normalizeToWeekStart(startDate);

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const d = new Date(`${monday}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + index);
    return {
      date: d.toISOString().slice(0, 10),
      dayOfWeek: index,
    };
  });

  const startAt = localToUtc(weekDays[0].date, '00:00', timezone);
  const endAt = localToUtc(weekDays[6].date, '23:59', timezone);

  return { startAt, endAt, weekDays };
}

function normalizeToWeekStart(startDate?: string): string {
  const source = startDate ? new Date(`${startDate}T00:00:00.000Z`) : new Date();
  const currentDay = source.getUTCDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  source.setUTCDate(source.getUTCDate() + mondayOffset);
  return source.toISOString().slice(0, 10);
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function uniqueRecurringLessonSlots(
  slots: CreateRecurringLesson['slots'],
): CreateRecurringLesson['slots'] {
  const seen = new Set<string>();
  return slots.filter((slot) => {
    const key = `${slot.dayOfWeek}:${slot.date}:${slot.startTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
