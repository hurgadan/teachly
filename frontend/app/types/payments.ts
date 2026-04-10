export type PaymentType = 'prepaid' | 'postpaid'

export interface Payment {
  id: string
  teacherId: string
  studentId: string | null
  groupId: string | null
  amount: number
  lessonsCount: number
  type: PaymentType
  comment: string | null
  createdAt: string
}

export interface CreatePayment {
  studentId: string
  lessonsCount: number
  type: PaymentType
  comment?: string | null
}

export interface StudentBalance {
  studentId: string
  totalPaid: number
  totalCharged: number
  balance: number
  paidLessonsCount: number
  unpaidLessons: number
  isOverdue: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
