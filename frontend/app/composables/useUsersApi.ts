import { UsersApi } from '@contracts/users'

import type {
  CreateUser,
  TeacherProfile,
  UpdateProfile,
  UpdateWorkSchedule,
  WorkSchedule,
} from '@contracts/users'

type ApiRequest = ReturnType<typeof useApi>['api']

class UsersHttpApi extends UsersApi {
  public constructor(private readonly request: ApiRequest) {
    super()
  }

  protected createUser(data: CreateUser) {
    return this.request(`${this.baseUrl}`, {
      method: 'POST',
      body: data,
    })
  }

  public registerUser(data: CreateUser) {
    return this.createUser(data)
  }

  public getMyProfile() {
    return this.request<TeacherProfile>(`${this.baseUrl}/me`)
  }

  public updateMyProfile(data: UpdateProfile) {
    return this.request<TeacherProfile>(`${this.baseUrl}/me`, {
      method: 'PUT',
      body: data,
    })
  }

  public getMyWorkSchedule() {
    return this.request<WorkSchedule[]>(`${this.baseUrl}/me/work-schedule`)
  }

  public updateMyWorkSchedule(data: UpdateWorkSchedule) {
    return this.request<WorkSchedule[]>(`${this.baseUrl}/me/work-schedule`, {
      method: 'PUT',
      body: data,
    })
  }
}

export function useUsersApi() {
  const { api } = useApi()
  const usersApi = new UsersHttpApi(api)

  return {
    createUser: (payload: CreateUser) => usersApi.registerUser(payload),
    getMyProfile: () => usersApi.getMyProfile(),
    getMyWorkSchedule: () => usersApi.getMyWorkSchedule(),
    updateMyProfile: (payload: UpdateProfile) => usersApi.updateMyProfile(payload),
    updateMyWorkSchedule: (payload: UpdateWorkSchedule) => usersApi.updateMyWorkSchedule(payload),
  }
}
