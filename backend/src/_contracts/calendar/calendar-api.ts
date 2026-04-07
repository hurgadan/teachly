import { ApiBase } from '../api-base';
import { AvailableSlot } from './available-slot.type';
import { CalendarLesson } from './calendar-lesson.type';
import { CreateOneTimeLesson } from './create-one-time-lesson.type';
import { CreateRecurringSchedule } from './create-recurring-schedule.type';

export abstract class CalendarApi implements ApiBase {
  public readonly baseUrl = '/calendar';

  protected abstract getWeek(startDate?: string): Promise<CalendarLesson[]>;
  protected abstract getAvailableSlots(
    startDate: string,
    duration: number,
  ): Promise<AvailableSlot[]>;
  protected abstract createRecurringSchedule(
    data: CreateRecurringSchedule,
  ): Promise<CalendarLesson[]>;
  protected abstract createOneTimeLesson(data: CreateOneTimeLesson): Promise<CalendarLesson>;
}
