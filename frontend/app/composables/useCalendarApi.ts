import { CalendarApi } from '@contracts/calendar'

import type {
  AvailableSlot,
  CalendarLesson,
  CreateOneTimeLesson,
  CreateRecurringSchedule,
} from '~/types/calendar'

type ApiRequest = ReturnType<typeof useApi>['api']

class CalendarHttpApi extends CalendarApi {
  public constructor(private readonly request: ApiRequest) {
    super()
  }

  protected getWeek(startDate?: string): Promise<CalendarLesson[]> {
    const query = startDate ? `?startDate=${encodeURIComponent(startDate)}` : ''
    return this.request<CalendarLesson[]>(`${this.baseUrl}/week${query}`)
  }

  protected getAvailableSlots(startDate: string, duration: number): Promise<AvailableSlot[]> {
    const query = new URLSearchParams({
      startDate,
      duration: String(duration),
    })

    return this.request<AvailableSlot[]>(`${this.baseUrl}/available-slots?${query.toString()}`)
  }

  protected createRecurringSchedule(data: CreateRecurringSchedule): Promise<CalendarLesson[]> {
    return this.request<CalendarLesson[]>(`${this.baseUrl}/recurring-lessons`, {
      method: 'POST',
      body: data,
    })
  }

  protected createOneTimeLesson(data: CreateOneTimeLesson): Promise<CalendarLesson> {
    return this.request<CalendarLesson>(`${this.baseUrl}/lessons`, {
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

  public saveRecurringSchedule(data: CreateRecurringSchedule) {
    return this.createRecurringSchedule(data)
  }

  public createSingleLesson(data: CreateOneTimeLesson) {
    return this.createOneTimeLesson(data)
  }
}

export function useCalendarApi() {
  const { api } = useApi()
  const calendarApi = new CalendarHttpApi(api)

  return {
    createOneTimeLesson: (payload: CreateOneTimeLesson) => calendarApi.createSingleLesson(payload),
    createRecurringSchedule: (payload: CreateRecurringSchedule) => calendarApi.saveRecurringSchedule(payload),
    getAvailableSlots: (startDate: string, duration: number) => calendarApi.getWeekAvailableSlots(startDate, duration),
    getWeekLessons: (startDate?: string) => calendarApi.getWeekLessons(startDate),
  }
}
