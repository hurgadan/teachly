<script setup lang="ts">
import type { Student } from '~/types/students'
import type { StudentBalance } from '@hurgadan/teachly-contracts'

const { listStudents, getStudentsBalances } = useStudentsApi()

const students = ref<Student[]>([])
const balancesMap = ref<Map<string, StudentBalance>>(new Map())
const loading = ref(true)

const search = ref('')
const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

const statusLabel: Record<string, string> = {
  active: 'Активный',
  paused: 'Пауза',
  archived: 'Архив',
}
const showCreateModal = ref(false)
const { show } = useToast()

function formatPrice(amount?: number | null): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '—'
  }

  return amount.toLocaleString('ru-RU') + ' ₽'
}

function getStudentInitials(student: Student): string {
  const first = student.firstName?.[0] || ''
  const last = student.lastName?.[0] || ''
  return `${first}${last}` || '—'
}

async function loadStudents(query = '') {
  try {
    loading.value = true
    students.value = await listStudents(query)
  } catch {
    show('Ошибка при загрузке учеников')
  } finally {
    loading.value = false
  }
}

async function loadBalances() {
  try {
    const balancesData = await getStudentsBalances()
    balancesMap.value = new Map(balancesData.map(b => [b.studentId, b]))
  } catch {
    // балансы некритичны, ошибку игнорируем
  }
}

watch(search, (value) => {
  if (searchDebounce.value) clearTimeout(searchDebounce.value)
  searchDebounce.value = setTimeout(() => {
    void loadStudents(value)
  }, 250)
})

onMounted(async () => {
  await Promise.all([loadStudents(), loadBalances()])
})

function onStudentCreated(id: string) {
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
    <UiPageHeader title="Ученики" :subtitle="loading ? 'Загрузка...' : `Всего: ${students.length}`">
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
              <th>Долг</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="student in students"
              :key="student.id"
              class="hover:bg-base-200/50 cursor-pointer"
              @click="navigateTo(`/students/${student.id}`)"
            >
              <td>
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-neutral text-neutral-content w-8 rounded-full flex items-center justify-center">
                      <span class="text-xs">{{ getStudentInitials(student) }}</span>
                    </div>
                  </div>
                  <div>
                    <p class="font-medium">{{ student.firstName || 'Без имени' }} {{ student.lastName || '' }}</p>
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
                <span
                  v-if="balancesMap.get(student.id)?.isOverdue"
                  class="badge badge-sm badge-error"
                >
                  {{ formatPrice(Math.abs(balancesMap.get(student.id)!.balance)) }}
                </span>
                <span v-else class="text-base-content/30">—</span>
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
        v-for="student in students"
        :key="student.id"
        :to="`/students/${student.id}`"
        class="card bg-base-100 shadow-sm"
      >
        <div class="card-body p-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content w-10 rounded-full flex items-center justify-center">
                  <span class="text-sm">{{ getStudentInitials(student) }}</span>
                </div>
              </div>
              <div>
                <p class="font-medium">{{ student.firstName || 'Без имени' }} {{ student.lastName || '' }}</p>
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
            <span
              v-if="balancesMap.get(student.id)?.isOverdue"
              class="badge badge-xs badge-error ml-auto"
            >
              Долг {{ formatPrice(Math.abs(balancesMap.get(student.id)!.balance)) }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-if="!loading && students.length === 0" class="text-sm text-base-content/50 py-8 text-center">
      Ученики не найдены
    </div>

    <ModalsCreateStudentModal :open="showCreateModal" @close="showCreateModal = false" @created="onStudentCreated" />
  </div>
</template>
