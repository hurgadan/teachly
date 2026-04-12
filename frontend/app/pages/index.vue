<script setup lang="ts">
import type { Student } from '~/types/students'
import type { Lesson } from '~/types/calendar'
import type { Payment } from '~/types/payments'
import type { StudentBalance } from '@hurgadan/teachly-contracts'

const { listStudents, getStudentsBalances } = useStudentsApi()
const { getWeekLessons } = useCalendarApi()
const { getPayments } = usePaymentsApi()

const students = ref<Student[]>([])
const lessons = ref<Lesson[]>([])
const recentPayments = ref<Payment[]>([])
const overdueBalances = ref<StudentBalance[]>([])
const loading = ref(true)

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

function getTodayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: userTimezone,
  }).format(new Date())
}

function getLocalDateStr(startAt: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: userTimezone,
  }).format(new Date(startAt))
}

function getLocalTimeStr(startAt: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit',
    timeZone: userTimezone,
    hour12: false,
  }).format(new Date(startAt))
}

const todayLessons = computed(() => {
  const today = getTodayStr()
  return lessons.value.filter(l => getLocalDateStr(l.startAt) === today)
})

const completedToday = computed(() => todayLessons.value.filter(l => l.status === 'completed').length)
const scheduledToday = computed(() => todayLessons.value.filter(l => l.status === 'scheduled').length)
const activeStudentsCount = computed(() => students.value.filter(s => s.status === 'active').length)

const currentMonthIncome = computed(() => {
  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return recentPayments.value
    .filter(p => p.createdAt.startsWith(monthStr))
    .reduce((sum, p) => sum + p.amount, 0)
})

function formatPrice(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' })
    .format(new Date(dateStr))
}

const statusLabel: Record<string, string> = {
  completed: 'Проведено',
  scheduled: 'Запланировано',
  cancelled: 'Отменено',
}
const statusClass: Record<string, string> = {
  completed: 'badge-success',
  scheduled: 'badge-info',
  cancelled: 'badge-error',
}

const showPaymentModal = ref(false)

async function loadData() {
  try {
    loading.value = true
    const [studentsData, lessonsData, paymentsData, balancesData] = await Promise.all([
      listStudents(),
      getWeekLessons(),
      getPayments({ page: 1, limit: 50 }),
      getStudentsBalances(),
    ])
    students.value = studentsData
    lessons.value = lessonsData
    recentPayments.value = paymentsData.items
    overdueBalances.value = balancesData.filter(b => b.isOverdue)
  } catch {
    // ignore errors on dashboard
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <div>
    <UiPageHeader title="Главная" subtitle="Обзор вашего рабочего дня" />

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Активных учеников</p>
          <p class="text-2xl font-bold mt-1">
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            <span v-else>{{ activeStudentsCount }}</span>
          </p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Занятий сегодня</p>
          <p class="text-2xl font-bold mt-1">
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            <span v-else>{{ todayLessons.length }}</span>
          </p>
          <p v-if="!loading" class="text-xs text-base-content/50">{{ completedToday }} проведено · {{ scheduledToday }} впереди</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm col-span-2 lg:col-span-1">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Доход за текущий месяц</p>
          <p class="text-2xl font-bold mt-1 text-success">
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            <span v-else>{{ formatPrice(currentMonthIncome) }}</span>
          </p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Today's Schedule -->
      <div class="lg:col-span-2 card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <h2 class="card-title text-base">Расписание на сегодня</h2>
          <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md" />
          </div>
          <div v-else-if="todayLessons.length === 0" class="text-sm text-base-content/50 text-center py-8">
            Занятий сегодня нет
          </div>
          <div v-else class="divide-y divide-base-200 -mx-4 lg:-mx-6">
            <div
              v-for="lesson in todayLessons"
              :key="lesson.id"
              class="flex items-center gap-3 px-4 lg:px-6 py-3"
            >
              <div class="text-sm font-mono font-medium w-12 shrink-0 text-base-content/70">
                {{ getLocalTimeStr(lesson.startAt) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ lesson.title }}</p>
                <p class="text-xs text-base-content/50">{{ lesson.duration }} мин</p>
              </div>
              <span :class="['badge badge-sm', statusClass[lesson.status]]">
                {{ statusLabel[lesson.status] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <!-- Overdue students -->
        <div v-if="!loading && overdueBalances.length > 0" class="card bg-base-100 shadow-sm border border-error/30">
          <div class="card-body p-4 lg:p-6">
            <h2 class="card-title text-base text-error">
              Должники
              <span class="badge badge-error badge-sm">{{ overdueBalances.length }}</span>
            </h2>
            <div class="space-y-2 mt-1">
              <NuxtLink
                v-for="balance in overdueBalances"
                :key="balance.studentId"
                :to="`/students/${balance.studentId}`"
                class="flex items-center justify-between py-1 hover:text-primary transition-colors"
              >
                <span class="text-sm truncate">
                  {{ students.find(s => s.id === balance.studentId)?.firstName }}
                  {{ students.find(s => s.id === balance.studentId)?.lastName || '' }}
                </span>
                <span class="text-sm font-medium text-error shrink-0 ml-2">
                  {{ formatPrice(Math.abs(balance.balance)) }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent payments -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h2 class="card-title text-base">Последние оплаты</h2>
            <div v-if="loading" class="flex justify-center py-4">
              <span class="loading loading-spinner loading-sm" />
            </div>
            <div v-else-if="recentPayments.length === 0" class="text-sm text-base-content/50 text-center py-4">
              Нет оплат
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="payment in recentPayments.slice(0, 4)"
                :key="payment.id"
                class="flex items-center justify-between py-1.5"
              >
                <div class="min-w-0">
                  <NuxtLink
                    v-if="payment.studentId"
                    :to="`/students/${payment.studentId}`"
                    class="text-sm hover:text-primary transition-colors truncate block"
                  >
                    Ученик
                  </NuxtLink>
                  <p v-else class="text-sm truncate">Группа</p>
                  <p class="text-xs text-base-content/50">{{ formatDate(payment.createdAt) }}</p>
                </div>
                <span class="text-sm font-medium text-success shrink-0 ml-2">+{{ formatPrice(payment.amount) }}</span>
              </div>
            </div>
            <div class="flex gap-2 mt-2">
              <NuxtLink to="/payments" class="btn btn-ghost btn-sm">Все оплаты →</NuxtLink>
              <button class="btn btn-primary btn-sm" @click="showPaymentModal = true">+ Оплата</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalsAddPaymentModal
      :open="showPaymentModal"
      @close="showPaymentModal = false"
      @added="showPaymentModal = false; void loadData()"
    />
  </div>
</template>
