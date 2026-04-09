import { PaymentsApi } from '@hurgadan/teachly-contracts'

import type {
  CreatePayment,
  Payment,
  PaginatedResponse,
  StudentBalance,
} from '@hurgadan/teachly-contracts'

type ApiRequest = ReturnType<typeof useApi>['api']

class PaymentsHttpApi extends PaymentsApi {
  public constructor(private readonly request: ApiRequest) {
    super()
  }

  protected createPayment(data: CreatePayment): Promise<Payment> {
    return this.request<Payment>(this.baseUrl, {
      method: 'POST',
      body: data,
    })
  }

  protected getPayments(params: {
    studentId?: string
    groupId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Payment>> {
    const query = new URLSearchParams()
    if (params.studentId) query.set('studentId', params.studentId)
    if (params.groupId) query.set('groupId', params.groupId)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return this.request<PaginatedResponse<Payment>>(`${this.baseUrl}${qs ? `?${qs}` : ''}`)
  }

  public addPayment(data: CreatePayment) {
    return this.createPayment(data)
  }

  public listPayments(params: {
    studentId?: string
    groupId?: string
    page?: number
    limit?: number
  } = {}) {
    return this.getPayments(params)
  }

  public fetchStudentBalance(studentId: string): Promise<StudentBalance> {
    return this.request<StudentBalance>(`/students/${studentId}/balance`)
  }
}

export function usePaymentsApi() {
  const { api } = useApi()
  const paymentsApi = new PaymentsHttpApi(api)

  return {
    createPayment: (data: CreatePayment) => paymentsApi.addPayment(data),
    getPayments: (params?: Parameters<PaymentsHttpApi['listPayments']>[0]) =>
      paymentsApi.listPayments(params),
    getStudentBalance: (studentId: string) => paymentsApi.fetchStudentBalance(studentId),
  }
}
