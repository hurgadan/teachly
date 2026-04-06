<script setup lang="ts">
const { groups } = useMockData()

const showCreateModal = ref(false)

function onGroupCreated(id: number) {
  navigateTo(`/groups/${id}`)
}
</script>

<template>
  <div>
    <UiPageHeader title="Группы" :subtitle="`Всего: ${groups.length}`">
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
              <th>Расписание</th>
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
                        <span class="text-[10px]">{{ member.name.split(' ').map(n => n[0]).join('') }}</span>
                      </div>
                    </div>
                  </div>
                  <span class="text-sm text-base-content/60 ml-1">{{ group.members.length }} чел.</span>
                </div>
              </td>
              <td>{{ group.duration }} мин</td>
              <td>{{ group.schedule }}</td>
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
              <p class="text-sm text-base-content/60 mt-1">{{ group.schedule }}</p>
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

    <ModalsCreateGroupModal :open="showCreateModal" @close="showCreateModal = false" @created="onGroupCreated" />
  </div>
</template>
