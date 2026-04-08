import { Language } from './language.type';

export interface UpdateProfile {
  language?: Language;
  timezone?: string;
  bufferMinutesAfterLesson?: number;
}
