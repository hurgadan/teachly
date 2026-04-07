<script setup lang="ts">
import type { Student, StudentStatus } from '~/types/students'

const route = useRoute()
const { getStudent, updateStudent } = useStudentsApi()
const { show: showToast } = useToast()

const studentId = computed(() => String(route.params.id))
const student = ref<Student | null>(null)
const loading = ref(true)
const saving = ref(false)

const activeTab = ref('profile')

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
  startDate: '',
  comment: '',
})

function formatPrice(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽'
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
      form.startDate = student.value.startDate || ''
      form.comment = student.value.comment || ''
    }
  } catch {
    student.value = null
  } finally {
    loading.value = false
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
                  <option
                    v-for="opt in statusOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
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
                    <option
                      v-for="d in durationOptions"
                      :key="d"
                      :value="d"
                    >
                      {{ d }} мин
                    </option>
                  </select>
                </fieldset>
              </div>
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
          <button class="btn btn-primary btn-sm" :disabled="saving" @click="handleSaveProfile()">
            <span v-if="saving" class="loading loading-spinner loading-sm" />
            Сохранить
          </button>
        </div>
      </div>
    </div>

    <!-- Lessons tab -->
    <div v-if="activeTab === 'lessons'">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <div class="text-sm text-base-content/50 text-center py-8">
            История занятий появится на этапе 8
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
          <div class="text-sm text-base-content/50 text-center py-8">
            История оплат появится на этапе 8
          </div>
        </div>
      </div>
    </div>

    <ModalsScheduleModal
      :open="showScheduleModal"
      :entity-name="`${student.firstName} ${student.lastName}`"
      :default-duration="form.duration"
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
