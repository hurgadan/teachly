<script setup lang="ts">
import type { Group } from '~/types/groups'

const { listGroups } = useGroupsApi()
const { show } = useToast()

const groups = ref<Group[]>([])
const loading = ref(true)
const showCreateModal = ref(false)

function getMemberInitials(firstName: string, lastName: string | null): string {
  const first = firstName?.[0] || ''
  const last = lastName?.[0] || ''
  return `${first}${last}` || '—'
}

async function loadGroups() {
  try {
    loading.value = true
    groups.value = await listGroups()
  } catch {
    show('Ошибка при загрузке групп')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadGroups()
})

function onGroupCreated(id: string) {
  navigateTo(`/groups/${id}`)
}
</script>

<template>
  <div>
    <UiPageHeader title="Группы" :subtitle="loading ? 'Загрузка...' : `Всего: ${groups.length}`">
      <template #actions>
        <button class="btn btn-primary btn-sm" @click="showCreateModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Создать группу
        </button>
      </template>
    </UiPageHeader>

    <!-- Desktop table -->
    <div class="hidden lg:block card bg-base-100 shadow-sm">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Название</th>
              <th>Участники</th>
              <th>Длительность</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="group in groups"
              :key="group.id"
              class="hover:bg-base-200/50 cursor-pointer"
              @click="navigateTo(`/groups/${group.id}`)"
            >
              <td class="font-medium">{{ group.name }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <div class="avatar-group -space-x-3">
                    <div
                      v-for="member in group.members.slice(0, 3)"
                      :key="member.studentId"
                      class="avatar placeholder"
                    >
                      <div class="bg-neutral text-neutral-content w-7 rounded-full">
                        <span class="text-[10px]">{{ getMemberInitials(member.firstName, member.lastName) }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="text-sm text-base-content/60 ml-1">{{ group.members.length }} чел.</span>
                </div>
              </td>
              <td>{{ group.duration }} мин</td>
              <td>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-base-content/30">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile cards -->
    <div class="lg:hidden space-y-2">
      <NuxtLink
        v-for="group in groups"
        :key="group.id"
        :to="`/groups/${group.id}`"
        class="card bg-base-100 shadow-sm"
      >
        <div class="card-body p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-medium">{{ group.name }}</p>
              <p class="text-sm text-base-content/60 mt-1">{{ group.members.length }} участников</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-base-content/30 shrink-0">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <div class="flex items-center gap-4 mt-2 text-sm text-base-content/70">
            <span>{{ group.members.length }} участников</span>
            <span>{{ group.duration }} мин</span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="!loading && groups.length === 0" class="text-sm text-base-content/50 py-8 text-center">
      Группы не найдены
    </div>

    <ModalsCreateGroupModal :open="showCreateModal" @close="showCreateModal = false" @created="onGroupCreated" />
  </div>
</template>
