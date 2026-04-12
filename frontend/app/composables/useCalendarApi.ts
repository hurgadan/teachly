import { CalendarApi } from '@hurgadan/teachly-contracts'

import type {
  AvailableSlot,
  CancelRecurringLesson,
  CreateLesson,
  CreateRecurringLesson,
  Lesson,
  PaginatedResponse,
  RescheduleLesson,
  RescheduleRecurringLesson,
  UpdateLessonStatus,
} from '@hurgadan/teachly-contracts'

type ApiRequest = ReturnType<typeof useApi>['api']

class CalendarHttpApi extends CalendarApi {
  public constructor(private readonly request: ApiRequest) {
    super()
  }

  protected getWeek(startDate?: string): Promise<Lesson[]> {
    const query = startDate ? `?startDate=${encodeURIComponent(startDate)}` : ''
    return this.request<Lesson[]>(`${this.baseUrl}/week${query}`)
  }

  protected getAvailableSlots(startDate: string, duration: number): Promise<AvailableSlot[]> {
    const query = new URLSearchParams({ startDate, duration: String(duration) })
    return this.request<AvailableSlot[]>(`${this.baseUrl}/available-slots?${query.toString()}`)
  }

  protected createRecurringLesson(data: CreateRecurringLesson): Promise<Lesson[]> {
    return this.request<Lesson[]>(`${this.baseUrl}/recurring-lessons`, {
      method: 'POST',
      body: data,
    })
  }

  protected createLesson(data: CreateLesson): Promise<Lesson> {
    return this.request<Lesson>(`${this.baseUrl}/lessons`, {
      method: 'POST',
      body: data,
    })
  }

  protected getLessons(params: {
    studentId?: string
    groupId?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Lesson>> {
    const query = new URLSearchParams()
    if (params.studentId) query.set('studentId', params.studentId)
    if (params.groupId) query.set('groupId', params.groupId)
    if (params.page) query.set('page', String(params.page))
    if (params.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    return this.request<PaginatedResponse<Lesson>>(`${this.baseUrl}/lessons${qs ? `?${qs}` : ''}`)
  }

  protected updateLessonStatus(id: string, data: UpdateLessonStatus): Promise<Lesson> {
    return this.request<Lesson>(`${this.baseUrl}/lessons/${id}/status`, {
      method: 'PATCH',
      body: data,
    })
  }

  public getWeekLessons(startDate?: string) {
    return this.getWeek(startDate)
  }

  public getWeekAvailableSlots(startDate: string, duration: number) {
    return this.getAvailableSlots(startDate, duration)
  }

  public saveRecurringLesson(data: CreateRecurringLesson) {
    return this.createRecurringLesson(data)
  }

  public createSingleLesson(data: CreateLesson) {
    return this.createLesson(data)
  }

  public fetchLessons(params: Parameters<CalendarHttpApi['getLessons']>[0]) {
    return this.getLessons(params)
  }

  public patchLessonStatus(id: string, data: UpdateLessonStatus) {
    return this.updateLessonStatus(id, data)
  }

  public patchRescheduleLesson(id: string, data: RescheduleLesson): Promise<Lesson> {
    return this.request<Lesson>(`${this.baseUrl}/lessons/${id}/reschedule`, {
      method: 'PATCH',
      body: data,
    })
  }

  public patchCancelRecurringLesson(id: string, data: CancelRecurringLesson): Promise<void> {
    return this.request<void>(`${this.baseUrl}/recurring-lessons/${id}/cancel`, {
      method: 'PATCH',
      body: data,
    })
  }

  public patchRescheduleRecurringLesson(id: string, data: RescheduleRecurringLesson): Promise<void> {
    return this.request<void>(`${this.baseUrl}/recurring-lessons/${id}/reschedule`, {
      method: 'PATCH',
      body: data,
    })
  }
}

export function useCalendarApi() {
  const { api } = useApi()
  const calendarApi = new CalendarHttpApi(api)

  return {
    createLesson: (payload: CreateLesson) => calendarApi.createSingleLesson(payload),
    createRecurringLesson: (payload: CreateRecurringLesson) => calendarApi.saveRecurringLesson(payload),
    getAvailableSlots: (startDate: string, duration: number) => calendarApi.getWeekAvailableSlots(startDate, duration),
    getWeekLessons: (startDate?: string) => calendarApi.getWeekLessons(startDate),
    getLessons: (params: Parameters<CalendarHttpApi['fetchLessons']>[0]) => calendarApi.fetchLessons(params),
    updateLessonStatus: (id: string, data: UpdateLessonStatus) => calendarApi.patchLessonStatus(id, data),
    rescheduleLesson: (id: string, data: RescheduleLesson) => calendarApi.patchRescheduleLesson(id, data),
    cancelRecurringLesson: (id: string, data: CancelRecurringLesson) => calendarApi.patchCancelRecurringLesson(id, data),
    rescheduleRecurringLesson: (id: string, data: RescheduleRecurringLesson) => calendarApi.patchRescheduleRecurringLesson(id, data),
  }
}
