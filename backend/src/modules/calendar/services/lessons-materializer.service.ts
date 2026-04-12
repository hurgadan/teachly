import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { localToUtc } from '../../../_common/utils/timezone';
import { LessonStatus } from '../../../_contracts/calendar';
import { UsersService } from '../../users/services/users.service';
import { CALENDAR_MATERIALIZE_WEEKS_AHEAD } from '../constants';
import { RecurringLessonEntity } from '../dao/recurring-lesson.entity';
import { LessonsRepository } from '../repositories/lessons.repository';
import { RecurringLessonsRepository } from '../repositories/recurring-lessons.repository';

@Injectable()
export class LessonsMaterializerService {
  private readonly logger = new Logger(LessonsMaterializerService.name);

  constructor(
    private readonly lessonsRepository: LessonsRepository,
    private readonly recurringLessonsRepository: RecurringLessonsRepository,
    private readonly usersService: UsersService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  public async materializeAll(): Promise<void> {
    this.logger.log('Starting lessons materialization');

    const recurringLessons = await this.recurringLessonsRepository.findAllActive();

    if (!recurringLessons.length) {
      this.logger.log('No active recurring lessons found');
      return;
    }

    const weeks = buildWeeksAhead(CALENDAR_MATERIALIZE_WEEKS_AHEAD);
    const created = await this.materialize(recurringLessons, weeks);

    this.logger.log(`Materialization complete: ${created} lessons created`);
  }

  public async materializeForRecurringLessons(
    recurringLessons: RecurringLessonEntity[],
  ): Promise<void> {
    const weeks = buildWeeksAhead(CALENDAR_MATERIALIZE_WEEKS_AHEAD);
    await this.materialize(recurringLessons, weeks);
  }

  private async materialize(
    recurringLessons: RecurringLessonEntity[],
    weeks: { date: string; dayOfWeek: number }[],
  ): Promise<number> {
    const teacherIds = [...new Set(recurringLessons.map((r) => r.teacherId))];

    const timezoneMap = new Map<string, string>();
    await Promise.all(
      teacherIds.map(async (teacherId) => {
        const profile = await this.usersService.getProfile(teacherId);
        timezoneMap.set(teacherId, profile.timezone);
      }),
    );

    const candidateStartAts = recurringLessons.flatMap((recurringLesson) => {
      const timezone = timezoneMap.get(recurringLesson.teacherId)!;
      return weeks
        .filter((w) => w.dayOfWeek === recurringLesson.dayOfWeek)
        .map((day) => localToUtc(day.date, recurringLesson.startTime, timezone));
    });

    if (!candidateStartAts.length) {
      return 0;
    }

    const allIds = recurringLessons.map((r) => r.id);
    const existingLessons = await this.lessonsRepository.findByRecurringLessonsAndStartAts(
      allIds,
      candidateStartAts,
    );

    const existingKeys = new Set(
      existingLessons.map((lesson) => `${lesson.recurringLessonId}:${lesson.startAt.getTime()}`),
    );

    const lessonsToCreate = recurringLessons.flatMap((recurringLesson) => {
      const timezone = timezoneMap.get(recurringLesson.teacherId)!;
      const matchingDays = weeks.filter((w) => w.dayOfWeek === recurringLesson.dayOfWeek);

      return matchingDays
        .map((day) => ({
          day,
          startAt: localToUtc(day.date, recurringLesson.startTime, timezone),
        }))
        .filter(({ day }) => {
          if (!recurringLesson.cancelledFrom) return true;
          return new Date(`${day.date}T00:00:00.000Z`) < recurringLesson.cancelledFrom;
        })
        .filter(({ startAt }) => !existingKeys.has(`${recurringLesson.id}:${startAt.getTime()}`))
        .map(({ startAt }) => ({
          teacherId: recurringLesson.teacherId,
          studentId: recurringLesson.studentId,
          groupId: recurringLesson.groupId,
          recurringLessonId: recurringLesson.id,
          startAt,
          duration: recurringLesson.duration,
          status: LessonStatus.SCHEDULED,
        }));
    });

    if (lessonsToCreate.length) {
      await this.lessonsRepository.createMany(lessonsToCreate);
    }

    return lessonsToCreate.length;
  }
}

function buildWeeksAhead(weeksCount: number): { date: string; dayOfWeek: number }[] {
  const today = new Date();
  const currentDay = today.getUTCDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() + mondayOffset);

  const totalDays = weeksCount * 7;
  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(monday.getUTCDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      dayOfWeek: index % 7,
    };
  });
}
