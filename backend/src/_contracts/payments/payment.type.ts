export interface Payment {
  id: string;
  teacherId: string;
  studentId: string | null;
  groupId: string | null;
  amount: number;
  comment: string | null;
  createdAt: string;
}
