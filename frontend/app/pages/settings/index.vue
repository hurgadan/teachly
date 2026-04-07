<script setup lang="ts">
import { Language } from '@hurgadan/teachly-contracts'
import type {
  TeacherProfile,
  UpdateProfile,
  UpdateWorkSchedule,
  UpdateWorkScheduleItem,
} from '@hurgadan/teachly-contracts'

const { getMyProfile, getMyWorkSchedule, updateMyProfile, updateMyWorkSchedule } = useUsersApi()
const { user, fetchUser } = useAuth()
const { show: showToast } = useToast()

const WEEK_DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

const languageOptions = [
  { value: Language.RU, label: 'Русский' },
  { value: Language.EN, label: 'English' },
]

const bufferOptions = [0, 15, 30, 45, 60]

// Profile form
const profileForm = reactive({
  language: Language.RU,
  bufferMinutesAfterLesson: 0,
})

// Schedule form
interface ScheduleDay {
  dayOfWeek: number
  dayName: string
  isWorkday: boolean
  intervals: { startTime: string; endTime: string }[]
}

const schedule = ref<ScheduleDay[]>([])
const loadingProfile = ref(false)
const loadingSchedule = ref(false)
const savingProfile = ref(false)
const savingSchedule = ref(false)

// Time options for selects
function timeOptions() {
  const opts: string[] = []
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
}
const times = timeOptions()

// Init: load data from backend
onMounted(async () => {
  await Promise.all([loadProfile(), loadSchedule()])
})

async function loadProfile() {
  loadingProfile.value = true
  try {
    const profile: TeacherProfile = await getMyProfile()
    user.value = profile
    if (profile) {
      profileForm.language = profile.language
      profileForm.bufferMinutesAfterLesson = profile.bufferMinutesAfterLesson
    }
  } finally {
    loadingProfile.value = false
  }
}

async function loadSchedule() {
  loadingSchedule.value = true
  try {
    const data = await getMyWorkSchedule()
    schedule.value = WEEK_DAYS.map((dayName, i) => {
      const existing = data.find(d => d.dayOfWeek === i)
      return {
        dayOfWeek: i,
        dayName,
        isWorkday: existing?.isWorkday ?? false,
        intervals: existing?.intervals?.length
          ? existing.intervals.map(iv => ({ startTime: iv.startTime, endTime: iv.endTime }))
          : [{ startTime: '09:00', endTime: '18:00' }],
      }
    })
  } finally {
    loadingSchedule.value = false
  }
}

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    const payload: UpdateProfile = {
      language: profileForm.language,
      bufferMinutesAfterLesson: profileForm.bufferMinutesAfterLesson,
    }
    await updateMyProfile(payload)
    await fetchUser()
    showToast('Профиль сохранён')
  } catch {
    showToast('Ошибка при сохранении профиля')
  } finally {
    savingProfile.value = false
  }
}

async function handleSaveSchedule() {
  savingSchedule.value = true
  try {
    const schedules: UpdateWorkScheduleItem[] = schedule.value.map(day => ({
      dayOfWeek: day.dayOfWeek,
      isWorkday: day.isWorkday,
      intervals: day.isWorkday ? day.intervals : [],
    }))

    const payload: UpdateWorkSchedule = { schedules }
    await updateMyWorkSchedule(payload)
    showToast('Рабочий график сохранён')
  } catch {
    showToast('Ошибка при сохранении графика')
  } finally {
    savingSchedule.value = false
  }
}

function addInterval(dayIndex: number) {
  const day = schedule.value[dayIndex]
  if (!day) return

  day.intervals.push({ startTime: '09:00', endTime: '13:00' })
}

function removeInterval(dayIndex: number, intervalIndex: number) {
  const day = schedule.value[dayIndex]
  if (!day) return

  day.intervals.splice(intervalIndex, 1)
}
</script>

<template>
  <div>
    <UiPageHeader title="Настройки" subtitle="Профиль и рабочий график" />

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Profile -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <h3 class="font-semibold mb-4">Профиль преподавателя</h3>
          <div v-if="loadingProfile" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-md" />
          </div>
          <div v-else class="grid gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Email</legend>
              <input
                type="email"
                :value="user?.email"
                class="input input-bordered w-full"
                disabled
              />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Язык интерфейса</legend>
              <select v-model="profileForm.language" class="select select-bordered w-full">
                <option
                  v-for="opt in languageOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Буфер после занятия</legend>
              <select
                v-model.number="profileForm.bufferMinutesAfterLesson"
                class="select select-bordered w-full"
              >
                <option v-for="opt in bufferOptions" :key="opt" :value="opt">
                  {{ opt === 0 ? 'Без буфера' : `${opt} мин` }}
                </option>
              </select>
              <p class="text-xs text-base-content/50 mt-1">
                Минимальный перерыв между занятиями
              </p>
            </fieldset>
            <div class="flex justify-end gap-2 mt-2">
              <button class="btn btn-ghost btn-sm" @click="loadProfile">Отмена</button>
              <button
                class="btn btn-primary btn-sm"
                :disabled="savingProfile"
                @click="handleSaveProfile"
              >
                <span v-if="savingProfile" class="loading loading-spinner loading-sm" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Work Schedule -->
      <div class="space-y-6">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h3 class="font-semibold mb-4">Рабочий график</h3>
            <div v-if="loadingSchedule" class="flex justify-center py-8">
              <span class="loading loading-spinner loading-md" />
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="(day, dayIndex) in schedule"
                :key="day.dayOfWeek"
                class="border border-base-300 rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="day.isWorkday"
                      type="checkbox"
                      class="toggle toggle-sm toggle-primary"
                    />
                    <span class="font-medium text-sm">{{ day.dayName }}</span>
                  </label>
                  <button
                    v-if="day.isWorkday"
                    class="btn btn-ghost btn-xs"
                    @click="addInterval(dayIndex)"
                  >
                    + интервал
                  </button>
                </div>

                <div v-if="day.isWorkday && day.intervals.length > 0" class="space-y-2 mt-2">
                  <div
                    v-for="(interval, intervalIndex) in day.intervals"
                    :key="intervalIndex"
                    class="flex items-center gap-2"
                  >
                    <select v-model="interval.startTime" class="select select-bordered select-sm flex-1">
                      <option v-for="t in times" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <span class="text-base-content/40 text-sm">—</span>
                    <select v-model="interval.endTime" class="select select-bordered select-sm flex-1">
                      <option v-for="t in times" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <button
                      v-if="day.intervals.length > 1"
                      class="btn btn-ghost btn-xs btn-square text-error"
                      @click="removeInterval(dayIndex, intervalIndex)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p v-if="day.isWorkday && day.intervals.length === 0" class="text-xs text-base-content/40 mt-2">
                  Добавьте рабочие интервалы
                </p>
                <p v-if="!day.isWorkday" class="text-xs text-base-content/40 mt-1">
                  Выходной
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm" @click="loadSchedule">Отмена</button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="savingSchedule"
            @click="handleSaveSchedule"
          >
            <span v-if="savingSchedule" class="loading loading-spinner loading-sm" />
            Сохранить график
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
