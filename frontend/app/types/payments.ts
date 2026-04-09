export interface Payment {
  id: string
  teacherId: string
  studentId: string | null
  groupId: string | null
  amount: number
  comment: string | null
  createdAt: string
}

export interface CreatePayment {
  studentId?: string | null
  groupId?: string | null
  amount: number
  comment?: string | null
}

export interface StudentBalance {
  studentId: string
  totalPaid: number
  totalCharged: number
  balance: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
