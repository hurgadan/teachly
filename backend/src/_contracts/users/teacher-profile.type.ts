import { Language } from './language.type';
import { WorkSchedule } from './work-schedule.type';

export interface TeacherProfile {
  id: string;
  email: string;
  language: Language;
  timezone: string;
  bufferMinutesAfterLesson: number;
  workSchedules: WorkSchedule[];
  createdAt: string;
  updatedAt: string;
}
