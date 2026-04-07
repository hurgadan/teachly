import { StudentsApi } from '@contracts/students'

import type { CreateStudentPayload, Student, UpdateStudentPayload } from '~/types/students'

type ApiRequest = ReturnType<typeof useApi>['api']

class StudentsHttpApi extends StudentsApi {
  public constructor(private readonly request: ApiRequest) {
    super()
  }

  protected createStudent(data: CreateStudentPayload): Promise<Student> {
    return this.request<Student>(this.baseUrl, {
      method: 'POST',
      body: data,
    })
  }

  protected getStudents(search?: string): Promise<Student[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : ''
    return this.request<Student[]>(`${this.baseUrl}${query}`)
  }

  protected getStudent(id: string): Promise<Student> {
    return this.request<Student>(`${this.baseUrl}/${id}`)
  }

  protected updateStudent(id: string, data: UpdateStudentPayload): Promise<Student> {
    return this.request<Student>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  public listStudents(search?: string) {
    return this.getStudents(search)
  }

  public getStudentById(id: string) {
    return this.getStudent(id)
  }

  public createStudentEntry(data: CreateStudentPayload) {
    return this.createStudent(data)
  }

  public updateStudentEntry(id: string, data: UpdateStudentPayload) {
    return this.updateStudent(id, data)
  }
}

export function useStudentsApi() {
  const { api } = useApi()
  const studentsApi = new StudentsHttpApi(api)

  return {
    createStudent: (payload: CreateStudentPayload) => studentsApi.createStudentEntry(payload),
    getStudent: (id: string) => studentsApi.getStudentById(id),
    listStudents: (search?: string) => studentsApi.listStudents(search),
    updateStudent: (id: string, payload: UpdateStudentPayload) => studentsApi.updateStudentEntry(id, payload),
  }
}
