<script setup lang="ts">
import type { Student, StudentStatus } from '~/types/students'
import type { Lesson } from '~/types/calendar'
import type { Payment } from '~/types/payments'
import type { StudentBalance } from '@hurgadan/teachly-contracts'
import { LessonStatus, type PaymentType } from '@hurgadan/teachly-contracts'

const route = useRoute()
const { getStudent, updateStudent, getStudentBalance } = useStudentsApi()
const { getLessons, updateLessonStatus } = useCalendarApi()
const { getPayments } = usePaymentsApi()
const { show: showToast } = useToast()

const studentId = computed(() => String(route.params.id))
const student = ref<Student | null>(null)
const loading = ref(true)
const saving = ref(false)

const activeTab = ref('profile')

// Lessons tab
const lessons = ref<Lesson[]>([])
const lessonsTotal = ref(0)
const lessonsLoading = ref(false)

// Payments tab
const payments = ref<Payment[]>([])
const paymentsTotal = ref(0)
const balance = ref<StudentBalance | null>(null)
const paymentsLoading = ref(false)

const statusOptions = [
  { value: 'active', label: 'Активный' },
  { value: 'paused', label: 'Пауза' },
  { value: 'archived', label: 'Архив' },
]
const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)

const showScheduleModal = ref(false)
const showPaymentModal = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  telegram: '',
  status: 'active' as StudentStatus,
  price: 2000,
  duration: 60,
  paymentType: 'prepaid' as PaymentType,
  paymentThresholdLessons: 12,
  startDate: '',
  comment: '',
})

function formatPrice(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(dateStr))
}

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

function getLocalTimeStr(startAt: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZone: userTimezone,
    hour12: false,
  }).format(new Date(startAt))
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

async function loadStudent() {
  try {
    loading.value = true
    student.value = await getStudent(studentId.value)

    if (student.value) {
      form.firstName = student.value.firstName
      form.lastName = student.value.lastName || ''
      form.phone = student.value.phone || ''
      form.email = student.value.email || ''
      form.telegram = student.value.telegram || ''
      form.status = student.value.status
      form.price = student.value.price
      form.duration = student.value.duration
      form.paymentType = student.value.paymentType
      form.paymentThresholdLessons = student.value.paymentThresholdLessons
      form.startDate = student.value.startDate || ''
      form.comment = student.value.comment || ''
    }
  } catch {
    student.value = null
  } finally {
    loading.value = false
  }
}

async function loadLessons() {
  try {
    lessonsLoading.value = true
    const result = await getLessons({ studentId: studentId.value, page: 1, limit: 50 })
    lessons.value = result.items
    lessonsTotal.value = result.total
  } catch {
    // ignore
  } finally {
    lessonsLoading.value = false
  }
}

async function loadPaymentsTab() {
  try {
    paymentsLoading.value = true
    const [paymentsResult, balanceResult] = await Promise.all([
      getPayments({ studentId: studentId.value, page: 1, limit: 50 }),
      getStudentBalance(studentId.value),
    ])
    payments.value = paymentsResult.items
    paymentsTotal.value = paymentsResult.total
    balance.value = balanceResult
  } catch {
    // ignore
  } finally {
    paymentsLoading.value = false
  }
}

async function handleMarkCompleted(lessonId: string) {
  try {
    await updateLessonStatus(lessonId, { status: LessonStatus.COMPLETED })
    await loadLessons()
    showToast('Занятие отмечено как проведённое')
  } catch {
    showToast('Ошибка при обновлении статуса')
  }
}

async function handleSaveProfile() {
  try {
    saving.value = true
    student.value = await updateStudent(studentId.value, {
      firstName: form.firstName,
      lastName: form.lastName || null,
      phone: form.phone || null,
      email: form.email || null,
      telegram: form.telegram || null,
      status: form.status,
      price: form.price,
      duration: form.duration,
      paymentType: form.paymentType,
      paymentThresholdLessons: form.paymentThresholdLessons,
      startDate: form.startDate || null,
      comment: form.comment || null,
    })
    showToast('Профиль сохранён')
  } catch {
    showToast('Ошибка при сохранении профиля')
  } finally {
    saving.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'lessons' && lessons.value.length === 0 && !lessonsLoading.value) {
    void loadLessons()
  }
  if (tab === 'payments' && payments.value.length === 0 && !paymentsLoading.value) {
    void loadPaymentsTab()
  }
})

onMounted(async () => {
  await loadStudent()
})
</script>

<template>
  <div v-if="loading" class="flex justify-center py-12">
    <span class="loading loading-spinner loading-lg" />
  </div>

  <div v-else-if="student">
    <!-- Back link -->
    <NuxtLink to="/students" class="btn btn-ghost btn-sm gap-1 mb-4 -ml-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      Ученики
    </NuxtLink>

    <UiPageHeader :title="`${student.firstName} ${student.lastName || ''}`.trim()">
      <template #actions>
        <button class="btn btn-primary btn-sm" @click="showScheduleModal = true">Сформировать расписание</button>
      </template>
    </UiPageHeader>

    <!-- Tabs -->
    <div role="tablist" class="tabs tabs-bordered mb-6">
      <button role="tab" :class="['tab', { 'tab-active': activeTab === 'profile' }]" @click="activeTab = 'profile'">
        Профиль
      </button>
      <button role="tab" :class="['tab', { 'tab-active': activeTab === 'lessons' }]" @click="activeTab = 'lessons'">
        Занятия
      </button>
      <button role="tab" :class="['tab', { 'tab-active': activeTab === 'payments' }]" @click="activeTab = 'payments'">
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
                <input v-model="form.firstName" type="text" class="input input-bordered w-full" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Фамилия</legend>
                <input v-model="form.lastName" type="text" class="input input-bordered w-full" />
              </fieldset>
            </div>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Телефон</legend>
              <input v-model="form.phone" type="tel" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Email</legend>
              <input v-model="form.email" type="email" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Telegram</legend>
              <input v-model="form.telegram" type="text" class="input input-bordered w-full" />
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
                <select v-model="form.status" class="select select-bordered w-full">
                  <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </fieldset>
              <div class="grid sm:grid-cols-2 gap-4">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Цена за занятие, ₽</legend>
                  <input v-model.number="form.price" type="number" class="input input-bordered w-full" />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Длительность</legend>
                  <select v-model.number="form.duration" class="select select-bordered w-full">
                    <option v-for="d in durationOptions" :key="d" :value="d">{{ d }} мин</option>
                  </select>
                </fieldset>
              </div>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Тип оплаты</legend>
                <div class="flex gap-4 pt-1">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.paymentType" value="prepaid" class="radio radio-sm radio-primary" />
                    <span class="text-sm">Предоплата</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="form.paymentType" value="postpaid" class="radio radio-sm radio-primary" />
                    <span class="text-sm">Постфактум</span>
                  </label>
                </div>
              </fieldset>
              <fieldset v-if="form.paymentType === 'postpaid'" class="fieldset">
                <legend class="fieldset-legend">Порог оплаты, занятий</legend>
                <input v-model.number="form.paymentThresholdLessons" type="number" class="input input-bordered w-full" min="1" max="100" step="1" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Дата начала занятий</legend>
                <input v-model="form.startDate" type="date" class="input input-bordered w-full" />
              </fieldset>
            </div>
          </div>
        </div>

        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h3 class="font-semibold mb-4">Комментарий</h3>
            <textarea v-model="form.comment" class="textarea textarea-bordered w-full" rows="3" />
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" @click="void loadStudent()">Отмена</button>
          <button class="btn btn-primary btn-sm" :disabled="saving" @click="handleSaveProfile()">
            <span v-if="saving" class="loading loading-spinner loading-sm" />
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Lessons tab -->
    <div v-if="activeTab === 'lessons'">
      <div v-if="lessonsLoading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>
      <div v-else-if="lessons.length === 0" class="card bg-base-100 shadow-sm">
        <div class="card-body text-center py-12 text-base-content/50">
          Занятий пока нет
        </div>
      </div>
      <div v-else class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <h3 class="font-semibold mb-4">История занятий ({{ lessonsTotal }})</h3>
          <div class="divide-y divide-base-200">
            <div
              v-for="lesson in lessons"
              :key="lesson.id"
              class="flex items-center gap-3 py-3"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{{ getLocalTimeStr(lesson.startAt) }}</p>
                <p class="text-xs text-base-content/50">{{ lesson.duration }} мин</p>
              </div>
              <span :class="['badge badge-sm', lessonStatusClass[lesson.status]]">
                {{ lessonStatusLabel[lesson.status] }}
              </span>
              <button
                v-if="lesson.status === 'scheduled'"
                class="btn btn-xs btn-ghost"
                @click="handleMarkCompleted(lesson.id)"
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payments tab -->
    <div v-if="activeTab === 'payments'">
      <div v-if="paymentsLoading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>
      <template v-else>
        <!-- Debt alert -->
        <div v-if="balance?.isOverdue" class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <span>Долг: {{ balance.unpaidLessons }} неоплаченных занятий ({{ formatPrice(balance.unpaidLessons * (student?.price ?? 0)) }})</span>
        </div>

        <!-- Balance card -->
        <div v-if="balance" class="grid grid-cols-3 gap-3 mb-4">
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body p-4">
              <p class="text-xs text-base-content/60 uppercase tracking-wide">Оплачено занятий</p>
              <p class="text-xl font-bold mt-1 text-success">{{ balance.paidLessonsCount }}</p>
              <p class="text-xs text-base-content/40 mt-0.5">{{ formatPrice(balance.totalPaid) }}</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-sm">
            <div class="card-body p-4">
              <p class="text-xs text-base-content/60 uppercase tracking-wide">Начислено</p>
              <p class="text-xl font-bold mt-1">{{ formatPrice(balance.totalCharged) }}</p>
            </div>
          </div>
          <div class="card shadow-sm" :class="balance.balance < 0 ? 'bg-error/5 border border-error/20' : 'bg-success/5 border border-success/20'">
            <div class="card-body p-4">
              <p class="text-xs text-base-content/60 uppercase tracking-wide">Баланс</p>
              <p class="text-xl font-bold mt-1" :class="balance.balance < 0 ? 'text-error' : 'text-success'">
                {{ formatPrice(balance.balance) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Payments list -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">История оплат ({{ paymentsTotal }})</h3>
              <button class="btn btn-primary btn-sm" @click="showPaymentModal = true">+ Оплата</button>
            </div>
            <div v-if="payments.length === 0" class="text-sm text-base-content/50 text-center py-8">
              Оплат ещё нет
            </div>
            <div v-else class="divide-y divide-base-200">
              <div v-for="payment in payments" :key="payment.id" class="flex items-center justify-between py-3">
                <div>
                  <p class="text-sm">{{ formatDate(payment.createdAt) }}</p>
                  <p v-if="payment.comment" class="text-xs text-base-content/50">{{ payment.comment }}</p>
                </div>
                <span class="text-sm font-medium text-success">+{{ formatPrice(payment.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <ModalsScheduleModal
      :open="showScheduleModal"
      :entity-name="`${student.firstName} ${student.lastName}`"
      :entity-id="student.id"
      entity-type="student"
      :default-duration="form.duration"
      @close="showScheduleModal = false"
      @saved="showScheduleModal = false"
    />
    <ModalsAddPaymentModal
      :open="showPaymentModal"
      :student-id="student.id"
      @close="showPaymentModal = false"
      @added="showPaymentModal = false; void loadPaymentsTab()"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-base-content/50">Ученик не найден</p>
    <NuxtLink to="/students" class="btn btn-ghost btn-sm mt-4">← К списку учеников</NuxtLink>
  </div>
</template>
