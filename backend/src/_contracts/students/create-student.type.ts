export interface CreateStudent {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  telegram?: string | null;
  price: number;
  duration: number;
  startDate?: string | null;
  comment?: string | null;
}
