import { StudentStatus } from './student-status.type';

export interface UpdateStudent {
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  telegram?: string | null;
  status?: StudentStatus;
  price?: number;
  duration?: number;
  startDate?: string | null;
  comment?: string | null;
}
