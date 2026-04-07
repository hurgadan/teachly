import { ScheduleSlot } from './schedule-slot.type';

export interface CreateRecurringSchedule {
  studentId?: string;
  groupId?: string;
  duration: number;
  slots: ScheduleSlot[];
}
