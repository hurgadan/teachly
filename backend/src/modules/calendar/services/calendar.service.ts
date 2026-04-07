import { BadRequestException, Injectable } from '@nestjs/common';

import {
  AvailableSlot,
  CalendarLesson,
  CreateOneTimeLesson,
  CreateRecurringSchedule,
  LessonStatus,
  LessonTargetType,
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
  ) {}

  public async getWeek(teacherId: string, startDate?: string): Promise<CalendarLesson[]> {
    const weekDates = getWeekDates(startDate);
    await this.ensureRecurringLessonsForWeek(teacherId, weekDates);

    const lessons = await this.lessonsRepository.findInDateRange(
      teacherId,
      weekDates[0].date,
      weekDates[weekDates.length - 1].date,
    );

    return lessons.map(mapLessonToCalendarLesson);
  }

  public async getAvailableSlots(
    teacherId: string,
    startDate: string,
    duration: number,
  ): Promise<AvailableSlot[]> {
    const weekDates = getWeekDates(startDate);
    await this.ensureRecurringLessonsForWeek(teacherId, weekDates);

    const [profile, workSchedule, lessons] = await Promise.all([
      this.usersService.getProfile(teacherId),
      this.usersService.getWorkSchedule(teacherId),
      this.lessonsRepository.findInDateRange(
        teacherId,
        weekDates[0].date,
        weekDates[weekDates.length - 1].date,
      ),
    ]);

    const slots: AvailableSlot[] = [];

    for (const weekDay of weekDates) {
      const daySchedule = workSchedule.find((item) => item.dayOfWeek === weekDay.dayOfWeek);

      if (!daySchedule?.isWorkday) {
        continue;
      }

      const dayLessons = lessons.filter((lesson) => lesson.date === weekDay.date);
      const occupied = dayLessons.map((lesson) => ({
        start: timeToMinutes(lesson.startTime),
        end: timeToMinutes(lesson.endTime) + profile.bufferMinutesAfterLesson,
      }));

      for (const interval of daySchedule.intervals) {
        const intervalStart = timeToMinutes(interval.startTime);
        const intervalEnd = timeToMinutes(interval.endTime);

        for (
          let cursor = intervalStart;
          cursor + duration <= intervalEnd;
          cursor += CALENDAR_SLOT_STEP_MINUTES
        ) {
          const slotEnd = cursor + duration;
          const isConflict = occupied.some((range) => cursor < range.end && slotEnd > range.start);

          if (!isConflict) {
            slots.push({
              date: weekDay.date,
              dayOfWeek: weekDay.dayOfWeek,
              startTime: minutesToTime(cursor),
              endTime: minutesToTime(slotEnd),
            });
          }
        }
      }
    }

    return slots;
  }

  public async createRecurringSchedule(
    teacherId: string,
    data: CreateRecurringSchedule,
  ): Promise<CalendarLesson[]> {
    const target = await this.resolveTarget(teacherId, {
      studentId: data.studentId,
      groupId: data.groupId,
    });

    const uniqueSlots = uniqueScheduleSlots(data.slots);

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
        endTime: minutesToTime(timeToMinutes(slot.startTime) + data.duration),
        duration: data.duration,
        isActive: true,
      })),
    );

    const existingLessons = await this.lessonsRepository.findByRecurringLessonsAndDates(
      recurringLessons.map((item) => item.id),
      uniqueSlots.map((slot) => slot.date),
    );

    const existingKeys = new Set(
      existingLessons.map((lesson) => `${lesson.recurringLessonId}:${lesson.date}`),
    );

    const lessonsToCreate = recurringLessons
      .map((recurringLesson, index) => ({
        recurringLesson,
        slot: uniqueSlots[index],
      }))
      .filter(
        ({ recurringLesson, slot }) => !existingKeys.has(`${recurringLesson.id}:${slot.date}`),
      )
      .map(({ recurringLesson, slot }) => ({
        teacherId,
        studentId: recurringLesson.studentId,
        groupId: recurringLesson.groupId,
        recurringLessonId: recurringLesson.id,
        date: slot.date,
        startTime: recurringLesson.startTime,
        endTime: recurringLesson.endTime,
        duration: recurringLesson.duration,
        status: LessonStatus.SCHEDULED,
      }));

    if (lessonsToCreate.length) {
      await this.lessonsRepository.createMany(lessonsToCreate);
    }

    const dates = uniqueSlots.map((slot) => slot.date);
    const createdLessons = await this.lessonsRepository.findInDateRange(
      teacherId,
      dates.sort()[0],
      dates.sort()[dates.length - 1],
    );

    return createdLessons
      .filter(
        (lesson) =>
          lesson.studentId ===
            (target.type === LessonTargetType.STUDENT ? target.entityId : null) &&
          lesson.groupId === (target.type === LessonTargetType.GROUP ? target.entityId : null) &&
          dates.includes(lesson.date),
      )
      .map(mapLessonToCalendarLesson);
  }

  public async createOneTimeLesson(
    teacherId: string,
    data: CreateOneTimeLesson,
  ): Promise<CalendarLesson> {
    const target = await this.resolveTarget(teacherId, {
      studentId: data.studentId,
      groupId: data.groupId,
    });

    const availableSlots = await this.getAvailableSlots(teacherId, data.date, data.duration);
    const expectedEndTime = minutesToTime(timeToMinutes(data.startTime) + data.duration);
    const isAvailable = availableSlots.some(
      (slot) =>
        slot.date === data.date &&
        slot.startTime === data.startTime &&
        slot.endTime === expectedEndTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('Selected slot is not available');
    }

    const lesson = await this.lessonsRepository.createOne({
      teacherId,
      studentId: target.type === LessonTargetType.STUDENT ? target.entityId : null,
      groupId: target.type === LessonTargetType.GROUP ? target.entityId : null,
      recurringLessonId: null,
      date: data.date,
      startTime: data.startTime,
      endTime: expectedEndTime,
      duration: data.duration,
      status: LessonStatus.SCHEDULED,
    });

    const [createdLesson] = await this.lessonsRepository.findInDateRange(
      teacherId,
      lesson.date,
      lesson.date,
    );

    return mapLessonToCalendarLesson(createdLesson);
  }

  private async ensureRecurringLessonsForWeek(
    teacherId: string,
    weekDates: { date: string; dayOfWeek: number }[],
  ): Promise<void> {
    const recurringLessons = await this.recurringLessonsRepository.findActiveByTeacherAndDays(
      teacherId,
      weekDates.map((item) => item.dayOfWeek),
    );

    if (!recurringLessons.length) {
      return;
    }

    const existingLessons = await this.lessonsRepository.findByRecurringLessonsAndDates(
      recurringLessons.map((item) => item.id),
      weekDates.map((item) => item.date),
    );

    const existingKeys = new Set(
      existingLessons.map((lesson) => `${lesson.recurringLessonId}:${lesson.date}`),
    );

    const lessonsToCreate = recurringLessons.flatMap((recurringLesson) => {
      const weekDay = weekDates.find((item) => item.dayOfWeek === recurringLesson.dayOfWeek);
      if (!weekDay) {
        return [];
      }

      const key = `${recurringLesson.id}:${weekDay.date}`;
      if (existingKeys.has(key)) {
        return [];
      }

      return [
        {
          teacherId,
          studentId: recurringLesson.studentId,
          groupId: recurringLesson.groupId,
          recurringLessonId: recurringLesson.id,
          date: weekDay.date,
          startTime: recurringLesson.startTime,
          endTime: recurringLesson.endTime,
          duration: recurringLesson.duration,
          status: LessonStatus.SCHEDULED,
        },
      ];
    });

    if (lessonsToCreate.length) {
      await this.lessonsRepository.createMany(lessonsToCreate);
    }
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

function mapLessonToCalendarLesson(lesson: LessonEntity): CalendarLesson {
  const isStudent = !!lesson.studentId;

  return {
    id: lesson.id,
    type: isStudent ? LessonTargetType.STUDENT : LessonTargetType.GROUP,
    entityId: isStudent ? lesson.studentId! : lesson.groupId!,
    title: isStudent
      ? [lesson.student?.firstName, lesson.student?.lastName].filter(Boolean).join(' ')
      : lesson.group?.name || '',
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    duration: lesson.duration,
    status: lesson.status,
    recurring: !!lesson.recurringLessonId,
  };
}

function getWeekDates(startDate?: string): { date: string; dayOfWeek: number }[] {
  const monday = normalizeToWeekStart(startDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${monday}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      dayOfWeek: index,
    };
  });
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

function uniqueScheduleSlots(
  slots: CreateRecurringSchedule['slots'],
): CreateRecurringSchedule['slots'] {
  const seen = new Set<string>();
  return slots.filter((slot) => {
    const key = `${slot.dayOfWeek}:${slot.date}:${slot.startTime}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
