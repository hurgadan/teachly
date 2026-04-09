export interface CreatePayment {
  studentId?: string | null;
  groupId?: string | null;
  amount: number;
  comment?: string | null;
}
