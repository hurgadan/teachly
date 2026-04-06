<script setup lang="ts">
const route = useRoute()
const { getStudent, getStudentLessons, getStudentPayments, formatPrice, formatDate } = useMockData()

const studentId = Number(route.params.id)
const student = getStudent(studentId)
const lessons = getStudentLessons(studentId)
const studentPayments = getStudentPayments(studentId)

const activeTab = ref('profile')

const statusLabel: Record<string, string> = {
  active: 'Активный',
  paused: 'Пауза',
  archived: 'Архив',
}
const statusOptions = [
  { value: 'active', label: 'Активный' },
  { value: 'paused', label: 'Пауза' },
  { value: 'archived', label: 'Архив' },
]
const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)

const showScheduleModal = ref(false)
const showPaymentModal = ref(false)
const { show: showToast } = useToast()

function handleSaveProfile() {
  showToast('Профиль сохранён')
}

const lessonStatusLabel: Record<string, string> = {
  completed: 'Проведено',
  scheduled: 'Запланировано',
  cancelled: 'Отменено',
}
const lessonStatusClass: Record<string, string> = {
  completed: 'badge-success',
  scheduled: 'badge-info',
  cancelled: 'badge-error',
}
</script>

<template>
  <div v-if="student">
    <!-- Back link -->
    <NuxtLink to="/students" class="btn btn-ghost btn-sm gap-1 mb-4 -ml-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      Ученики
    </NuxtLink>

    <UiPageHeader :title="`${student.firstName} ${student.lastName}`">
      <template #actions>
        <button class="btn btn-primary btn-sm" @click="showScheduleModal = true">Сформировать расписание</button>
      </template>
    </UiPageHeader>

    <!-- Tabs -->
    <div role="tablist" class="tabs tabs-bordered mb-6">
      <button
        role="tab"
        :class="['tab', { 'tab-active': activeTab === 'profile' }]"
        @click="activeTab = 'profile'"
      >
        Профиль
      </button>
      <button
        role="tab"
        :class="['tab', { 'tab-active': activeTab === 'lessons' }]"
        @click="activeTab = 'lessons'"
      >
        Занятия
      </button>
      <button
        role="tab"
        :class="['tab', { 'tab-active': activeTab === 'payments' }]"
        @click="activeTab = 'payments'"
      >
        Оплаты
      </button>
    </div>

    <!-- Profile tab -->
    <div v-if="activeTab === 'profile'" class="grid lg:grid-cols-2 gap-6">
      <!-- Personal info -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <h3 class="font-semibold mb-4">Личные данные</h3>
          <div class="grid gap-4">
            <div class="grid sm:grid-cols-2 gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Имя</legend>
                <input type="text" :value="student.firstName" class="input input-bordered w-full" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Фамилия</legend>
                <input type="text" :value="student.lastName" class="input input-bordered w-full" />
              </fieldset>
            </div>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Телефон</legend>
              <input type="tel" :value="student.phone" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Email</legend>
              <input type="email" :value="student.email" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Telegram</legend>
              <input type="text" :value="student.telegram" class="input input-bordered w-full" />
            </fieldset>
          </div>
        </div>
      </div>

      <!-- Lesson params -->
      <div class="space-y-6">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h3 class="font-semibold mb-4">Параметры занятий</h3>
            <div class="grid gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Статус</legend>
                <select class="select select-bordered w-full">
                  <option
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :selected="opt.value === student.status"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </fieldset>
              <div class="grid sm:grid-cols-2 gap-4">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Цена за занятие, ₽</legend>
                  <input type="number" :value="student.price" class="input input-bordered w-full" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Длительность</legend>
                  <select class="select select-bordered w-full">
                    <option
                      v-for="d in durationOptions"
                      :key="d"
                      :value="d"
                      :selected="d === student.duration"
                    >
                      {{ d }} мин
                    </option>
                  </select>
                </fieldset>
              </div>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Дата начала занятий</legend>
                <input type="date" :value="student.startDate" class="input input-bordered w-full" />
              </fieldset>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h3 class="font-semibold mb-4">Комментарий</h3>
            <textarea class="textarea textarea-bordered w-full" rows="3">{{ student.comment }}</textarea>
          </div>
        </div>

        <!-- Debt summary -->
        <div v-if="student.debt > 0" class="card bg-error/5 border border-error/20">
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <p class="text-sm font-medium text-error">Задолженность</p>
              <p class="text-xs text-base-content/50">Начисления минус оплаты</p>
            </div>
            <p class="text-xl font-bold text-error">{{ formatPrice(student.debt) }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm">Отмена</button>
          <button class="btn btn-primary btn-sm" @click="handleSaveProfile()">Сохранить</button>
        </div>
      </div>
    </div>

    <!-- Lessons tab -->
    <div v-if="activeTab === 'lessons'">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <div v-if="lessons.length === 0" class="text-sm text-base-content/50 text-center py-8">
            Нет занятий
          </div>
          <div v-else class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Длительность</th>
                  <th>Статус</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lesson in lessons" :key="lesson.id">
                  <td>{{ lesson.date }}</td>
                  <td>{{ lesson.time }}</td>
                  <td>{{ lesson.duration }} мин</td>
                  <td>
                    <span :class="['badge badge-sm', lessonStatusClass[lesson.status]]">
                      {{ lessonStatusLabel[lesson.status] }}
                    </span>
                  </td>
                  <td class="font-medium">{{ formatPrice(lesson.price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments tab -->
    <div v-if="activeTab === 'payments'">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">История оплат</h3>
            <button class="btn btn-primary btn-sm" @click="showPaymentModal = true">Добавить оплату</button>
          </div>
          <div v-if="studentPayments.length === 0" class="text-sm text-base-content/50 text-center py-8">
            Нет оплат
          </div>
          <div v-else class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Способ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in studentPayments" :key="payment.id">
                  <td>{{ payment.date }}</td>
                  <td class="font-medium text-success">+{{ formatPrice(payment.amount) }}</td>
                  <td>{{ payment.method }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <ModalsScheduleModal
      :open="showScheduleModal"
      :entity-name="`${student.firstName} ${student.lastName}`"
      :default-duration="student.duration"
      @close="showScheduleModal = false"
      @saved="showScheduleModal = false"
    />
    <ModalsAddPaymentModal
      :open="showPaymentModal"
      :student-id="student.id"
      @close="showPaymentModal = false"
      @added="showPaymentModal = false"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-base-content/50">Ученик не найден</p>
    <NuxtLink to="/students" class="btn btn-ghost btn-sm mt-4">← К списку учеников</NuxtLink>
  </div>
</template>
