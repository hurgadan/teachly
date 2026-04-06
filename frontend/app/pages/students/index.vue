<script setup lang="ts">
const { students, formatPrice } = useMockData()

const search = ref('')
const filtered = computed(() => {
  if (!search.value) return students
  const q = search.value.toLowerCase()
  return students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q),
  )
})

const statusLabel: Record<string, string> = {
  active: 'Активный',
  paused: 'Пауза',
  archived: 'Архив',
}
const showCreateModal = ref(false)

function onStudentCreated(id: number) {
  navigateTo(`/students/${id}`)
}

const statusClass: Record<string, string> = {
  active: 'badge-success',
  paused: 'badge-warning',
  archived: 'badge-ghost',
}
</script>

<template>
  <div>
    <UiPageHeader title="Ученики" :subtitle="`Всего: ${students.length}`">
      <template #actions>
        <button class="btn btn-primary btn-sm" @click="showCreateModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Добавить ученика
        </button>
      </template>
    </UiPageHeader>

    <!-- Search -->
    <div class="mb-4">
      <label class="input input-bordered input-sm flex items-center gap-2 w-full sm:w-72">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 opacity-50">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input v-model="search" type="text" class="grow" placeholder="Поиск по имени или email..." />
      </label>
    </div>

    <!-- Desktop table -->
    <div class="hidden lg:block card bg-base-100 shadow-sm">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Статус</th>
              <th>Цена</th>
              <th>Длительность</th>
              <th>Задолженность</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in filtered"
              :key="student.id"
              class="hover:bg-base-200/50 cursor-pointer"
              @click="navigateTo(`/students/${student.id}`)"
            >
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-neutral text-neutral-content w-8 rounded-full">
                      <span class="text-xs">{{ student.firstName[0] }}{{ student.lastName[0] }}</span>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium">{{ student.firstName }} {{ student.lastName }}</p>
                    <p class="text-xs text-base-content/50">{{ student.email }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span :class="['badge badge-sm', statusClass[student.status]]">
                  {{ statusLabel[student.status] }}
                </span>
              </td>
              <td class="font-medium">{{ formatPrice(student.price) }}</td>
              <td>{{ student.duration }} мин</td>
              <td>
                <span v-if="student.debt > 0" class="font-medium text-error">{{ formatPrice(student.debt) }}</span>
                <span v-else class="text-base-content/40">—</span>
              </td>
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
        v-for="student in filtered"
        :key="student.id"
        :to="`/students/${student.id}`"
        class="card bg-base-100 shadow-sm"
      >
        <div class="card-body p-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content w-10 rounded-full">
                  <span class="text-sm">{{ student.firstName[0] }}{{ student.lastName[0] }}</span>
                </div>
              </div>
              <div>
                <p class="font-medium">{{ student.firstName }} {{ student.lastName }}</p>
                <span :class="['badge badge-xs', statusClass[student.status]]">
                  {{ statusLabel[student.status] }}
                </span>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-base-content/30 shrink-0 mt-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
          <div class="flex items-center gap-4 mt-2 text-sm text-base-content/70">
            <span>{{ formatPrice(student.price) }}</span>
            <span>{{ student.duration }} мин</span>
            <span v-if="student.debt > 0" class="text-error font-medium ml-auto">
              Долг: {{ formatPrice(student.debt) }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <ModalsCreateStudentModal :open="showCreateModal" @close="showCreateModal = false" @created="onStudentCreated" />
  </div>
</template>
