import { CalendarApi } from '@contracts/calendar'

import type {
  AvailableSlot,
  CreateLesson,
  CreateRecurringLesson,
  Lesson,
} from '~/types/calendar'

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
    const query = new URLSearchParams({
      startDate,
      duration: String(duration),
    })

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
}

export function useCalendarApi() {
  const { api } = useApi()
  const calendarApi = new CalendarHttpApi(api)

  return {
    createLesson: (payload: CreateLesson) => calendarApi.createSingleLesson(payload),
    createRecurringLesson: (payload: CreateRecurringLesson) => calendarApi.saveRecurringLesson(payload),
    getAvailableSlots: (startDate: string, duration: number) => calendarApi.getWeekAvailableSlots(startDate, duration),
    getWeekLessons: (startDate?: string) => calendarApi.getWeekLessons(startDate),
  }
}
