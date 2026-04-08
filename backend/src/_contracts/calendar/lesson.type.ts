import { LessonStatus } from './lesson-status.type';
import { LessonTargetType } from './lesson-target-type.type';

export interface Lesson {
  id: string;
  type: LessonTargetType;
  entityId: string;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  status: LessonStatus;
  recurring: boolean;
}
