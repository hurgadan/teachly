<script setup lang="ts">
const { todayLessons, formatPrice, activeStudentsCount, monthlyIncome, totalDebt, studentsWithDebt, payments } = useMockData()

const completedToday = todayLessons.filter(l => l.status === 'completed').length
const scheduledToday = todayLessons.filter(l => l.status === 'scheduled').length

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
</script>

<template>
  <div>
    <UiPageHeader title="Главная" subtitle="Обзор вашего рабочего дня" />

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Активных учеников</p>
          <p class="text-2xl font-bold mt-1">{{ activeStudentsCount }}</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Занятий сегодня</p>
          <p class="text-2xl font-bold mt-1">{{ todayLessons.length }}</p>
          <p class="text-xs text-base-content/50">{{ completedToday }} проведено · {{ scheduledToday }} впереди</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Доход за март</p>
          <p class="text-2xl font-bold mt-1 text-success">{{ formatPrice(monthlyIncome) }}</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Общая задолженность</p>
          <p class="text-2xl font-bold mt-1" :class="totalDebt > 0 ? 'text-error' : ''">{{ formatPrice(totalDebt) }}</p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Today's Schedule -->
      <div class="lg:col-span-2 card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <h2 class="card-title text-base">Расписание на сегодня</h2>
          <div class="divide-y divide-base-200 -mx-4 lg:-mx-6">
            <div
              v-for="lesson in todayLessons"
              :key="lesson.id"
              class="flex items-center gap-3 px-4 lg:px-6 py-3"
            >
              <div class="text-sm font-mono font-medium w-12 shrink-0 text-base-content/70">
                {{ lesson.time }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ lesson.title }}</p>
                <p class="text-xs text-base-content/50">{{ lesson.duration }} мин</p>
              </div>
              <span :class="['badge badge-sm', statusClass[lesson.status]]">
                {{ statusLabel[lesson.status] }}
              </span>
              <span v-if="lesson.price > 0" class="text-sm font-medium hidden sm:block">
                {{ formatPrice(lesson.price) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar column -->
      <div class="space-y-4">
        <!-- Debt alerts -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h2 class="card-title text-base">Задолженности</h2>
            <div v-if="studentsWithDebt.length === 0" class="text-sm text-base-content/50">
              Нет задолженностей
            </div>
            <div v-else class="space-y-2">
              <NuxtLink
                v-for="student in studentsWithDebt"
                :key="student.id"
                :to="`/students/${student.id}`"
                class="flex items-center justify-between py-1.5 hover:bg-base-200 -mx-2 px-2 rounded transition-colors"
              >
                <span class="text-sm">{{ student.firstName }} {{ student.lastName }}</span>
                <span class="text-sm font-medium text-error">{{ formatPrice(student.debt) }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Recent payments -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h2 class="card-title text-base">Последние оплаты</h2>
            <div class="space-y-2">
              <div
                v-for="payment in payments.slice(0, 4)"
                :key="payment.id"
                class="flex items-center justify-between py-1.5"
              >
                <div class="min-w-0">
                  <p class="text-sm truncate">{{ payment.studentName }}</p>
                  <p class="text-xs text-base-content/50">{{ payment.date }} · {{ payment.method }}</p>
                </div>
                <span class="text-sm font-medium text-success shrink-0 ml-2">+{{ formatPrice(payment.amount) }}</span>
              </div>
            </div>
            <NuxtLink to="/payments" class="btn btn-ghost btn-sm mt-2 self-start">
              Все оплаты →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
