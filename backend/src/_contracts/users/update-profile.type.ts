import { Language } from './language.type';

export interface UpdateProfile {
  language?: Language;
  bufferMinutesAfterLesson?: number;
}
