import { GroupsApi } from '@contracts/groups'

import type { CreateGroupPayload, Group, UpdateGroupPayload } from '~/types/groups'

type ApiRequest = ReturnType<typeof useApi>['api']

class GroupsHttpApi extends GroupsApi {
  public constructor(private readonly request: ApiRequest) {
    super()
  }

  protected createGroup(data: CreateGroupPayload): Promise<Group> {
    return this.request<Group>(this.baseUrl, {
      method: 'POST',
      body: data,
    })
  }

  protected getGroups(): Promise<Group[]> {
    return this.request<Group[]>(this.baseUrl)
  }

  protected getGroup(id: string): Promise<Group> {
    return this.request<Group>(`${this.baseUrl}/${id}`)
  }

  protected updateGroup(id: string, data: UpdateGroupPayload): Promise<Group> {
    return this.request<Group>(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  public listGroups() {
    return this.getGroups()
  }

  public getGroupById(id: string) {
    return this.getGroup(id)
  }

  public createGroupEntry(data: CreateGroupPayload) {
    return this.createGroup(data)
  }

  public updateGroupEntry(id: string, data: UpdateGroupPayload) {
    return this.updateGroup(id, data)
  }
}

export function useGroupsApi() {
  const { api } = useApi()
  const groupsApi = new GroupsHttpApi(api)

  return {
    createGroup: (payload: CreateGroupPayload) => groupsApi.createGroupEntry(payload),
    getGroup: (id: string) => groupsApi.getGroupById(id),
    listGroups: () => groupsApi.listGroups(),
    updateGroup: (id: string, payload: UpdateGroupPayload) => groupsApi.updateGroupEntry(id, payload),
  }
}
