<script setup lang="ts">
import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { LessonStatus } from '@hurgadan/teachly-contracts'
import type { AvailableSlot, Lesson } from '@hurgadan/teachly-contracts'

const props = defineProps<{ lesson: Lesson | null; open: boolean }>()
const emit = defineEmits<{ close: []; updated: [] }>()

const { updateLessonStatus, rescheduleLesson, cancelRecurringLesson, rescheduleRecurringLesson, getAvailableSlots } = useCalendarApi()
const { getMyWorkSchedule } = useUsersApi()
const { show } = useToast()

type View = 'detail' | 'cancel-scope' | 'reschedule-scope' | 'reschedule-pick'
const view = ref<View>('detail')
const loading = ref(false)
const loadingSlots = ref(false)

// Slot picker state
const weekStartDate = ref('')
const workSchedule = ref<Array<{ dayOfWeek: number; isWorkday: boolean }>>([])
const apiSlots = ref<AvailableSlot[]>([])
const activeDay = ref('0')
const selectedSlot = ref<AvailableSlot | null>(null)
const recurringScope = ref<'single' | 'all'>('single')

const weekDays = computed(() => buildWeekDays(weekStartDate.value))
const availableSlots = computed(() =>
  apiSlots.value.filter((slot) => String(slot.dayOfWeek) === activeDay.value),
)
const selectedDay = computed(() =>
  weekDays.value.find((day) => String(day.dayOfWeek) === activeDay.value) ?? null,
)

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

function getLocalTimeStr(startAt: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZone: userTimezone,
    hour12: false,
  }).format(new Date(startAt))
}

function getLessonDateStr(startAt: string) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    timeZone: userTimezone,
  }).format(new Date(startAt))
}

const statusLabel: Record<string, string> = {
  scheduled: 'Запланировано',
  completed: 'Проведено',
  cancelled: 'Отменено',
  rescheduled: 'Перенесено',
}
const statusClass: Record<string, string> = {
  scheduled: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
  rescheduled: 'badge-warning',
}

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  view.value = 'detail'
  selectedSlot.value = null
  recurringScope.value = 'single'
})

async function openReschedulePick() {
  const dateStr = getLessonDateStr(props.lesson!.startAt)
  weekStartDate.value = format(startOfWeek(parseISO(dateStr), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  view.value = 'reschedule-pick'
  await loadSlots()
}

async function loadSlots() {
  if (!props.lesson) return
  try {
    loadingSlots.value = true
    const [schedules, slots] = await Promise.all([
      getMyWorkSchedule(),
      getAvailableSlots(weekStartDate.value, props.lesson.duration),
    ])
    workSchedule.value = schedules
    apiSlots.value = slots
    activeDay.value = String(weekDays.value[0]?.dayOfWeek ?? 0)
  } finally {
    loadingSlots.value = false
  }
}

async function previousWeek() {
  weekStartDate.value = format(addDays(parseISO(weekStartDate.value), -7), 'yyyy-MM-dd')
  selectedSlot.value = null
  await loadSlots()
}

async function nextWeek() {
  weekStartDate.value = format(addDays(parseISO(weekStartDate.value), 7), 'yyyy-MM-dd')
  selectedSlot.value = null
  await loadSlots()
}

function isDayOff(dayOfWeek: number) {
  return workSchedule.value.some((d) => d.dayOfWeek === dayOfWeek && !d.isWorkday)
}

function getSlotEndTime(startTime: string) {
  const [h, m] = startTime.split(':').map(Number)
  const total = (h ?? 0) * 60 + (m ?? 0) + (props.lesson?.duration ?? 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// Actions
async function handleMarkCompleted() {
  if (!props.lesson) return
  try {
    loading.value = true
    await updateLessonStatus(props.lesson.id, { status: LessonStatus.COMPLETED })
    show('Занятие отмечено как проведённое')
    emit('updated')
    emit('close')
  } catch {
    show('Ошибка при обновлении статуса')
  } finally {
    loading.value = false
  }
}

async function handleCancelSingle() {
  if (!props.lesson) return
  try {
    loading.value = true
    await updateLessonStatus(props.lesson.id, { status: LessonStatus.CANCELLED })
    show('Занятие отменено')
    emit('updated')
    emit('close')
  } catch {
    show('Ошибка при отмене занятия')
  } finally {
    loading.value = false
  }
}

async function handleCancelAll() {
  if (!props.lesson?.recurringLessonId) return
  try {
    loading.value = true
    const cancelFrom = getLessonDateStr(props.lesson.startAt)
    await cancelRecurringLesson(props.lesson.recurringLessonId, { cancelFrom })
    show('Все будущие занятия отменены')
    emit('updated')
    emit('close')
  } catch {
    show('Ошибка при отмене расписания')
  } finally {
    loading.value = false
  }
}

async function handleRescheduleSingle() {
  if (!props.lesson || !selectedSlot.value) return
  try {
    loading.value = true
    await rescheduleLesson(props.lesson.id, {
      date: selectedSlot.value.date,
      startTime: selectedSlot.value.startTime,
    })
    show('Занятие перенесено')
    emit('updated')
    emit('close')
  } catch {
    show('Ошибка при переносе занятия')
  } finally {
    loading.value = false
  }
}

async function handleRescheduleAll() {
  if (!props.lesson?.recurringLessonId || !selectedSlot.value) return
  try {
    loading.value = true
    const cancelFrom = getLessonDateStr(props.lesson.startAt)
    await rescheduleRecurringLesson(props.lesson.recurringLessonId, {
      cancelFrom,
      dayOfWeek: selectedSlot.value.dayOfWeek,
      startTime: selectedSlot.value.startTime,
      duration: props.lesson.duration,
    })
    show('Расписание обновлено')
    emit('updated')
    emit('close')
  } catch {
    show('Ошибка при изменении расписания')
  } finally {
    loading.value = false
  }
}

function buildWeekDays(startDate: string) {
  if (!startDate) return []
  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  const start = parseISO(startDate)
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    return {
      short: labels[index],
      dateStr: format(date, 'yyyy-MM-dd'),
      dateLabel: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      dayOfWeek: index,
    }
  })
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-md">

      <!-- Detail view -->
      <template v-if="view === 'detail' && lesson">
        <h3 class="font-semibold text-lg mb-1">{{ lesson.title }}</h3>
        <p class="text-sm text-base-content/60 mb-4">{{ getLocalTimeStr(lesson.startAt) }} · {{ lesson.duration }} мин</p>
        <div class="flex items-center gap-2 mb-6">
          <span :class="['badge badge-sm', statusClass[lesson.status]]">{{ statusLabel[lesson.status] }}</span>
          <span v-if="lesson.recurring" class="badge badge-sm badge-outline">Регулярное</span>
        </div>

        <div v-if="lesson.status === LessonStatus.SCHEDULED || lesson.status === LessonStatus.RESCHEDULED" class="grid gap-2">
          <button class="btn btn-success btn-sm" :disabled="loading" @click="handleMarkCompleted">
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            Отметить проведённым
          </button>
          <button
            class="btn btn-outline btn-sm"
            :disabled="loading"
            @click="lesson.recurring ? (view = 'reschedule-scope') : openReschedulePick()"
          >
            Перенести
          </button>
          <button
            class="btn btn-error btn-outline btn-sm"
            :disabled="loading"
            @click="lesson.recurring ? (view = 'cancel-scope') : handleCancelSingle()"
          >
            Отменить
          </button>
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="emit('close')">Закрыть</button>
        </div>
      </template>

      <!-- Cancel scope for recurring -->
      <template v-else-if="view === 'cancel-scope'">
        <h3 class="font-semibold text-lg mb-2">Отменить занятие</h3>
        <p class="text-sm text-base-content/60 mb-5">Выберите, что именно отменить:</p>
        <div class="grid gap-2">
          <button class="btn btn-outline" :disabled="loading" @click="handleCancelSingle">
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            Только это занятие
          </button>
          <button class="btn btn-error btn-outline" :disabled="loading" @click="handleCancelAll">
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            Это и все будущие по расписанию
          </button>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="view = 'detail'">Назад</button>
        </div>
      </template>

      <!-- Reschedule scope for recurring -->
      <template v-else-if="view === 'reschedule-scope'">
        <h3 class="font-semibold text-lg mb-2">Перенести занятие</h3>
        <p class="text-sm text-base-content/60 mb-5">Выберите, что именно перенести:</p>
        <div class="grid gap-2">
          <button class="btn btn-outline" @click="recurringScope = 'single'; openReschedulePick()">
            Только это занятие
          </button>
          <button class="btn btn-primary btn-outline" @click="recurringScope = 'all'; openReschedulePick()">
            Изменить всё расписание (это и все будущие)
          </button>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="view = 'detail'">Назад</button>
        </div>
      </template>

      <!-- Reschedule slot picker -->
      <template v-else-if="view === 'reschedule-pick'">
        <h3 class="font-semibold text-lg mb-4">
          {{ recurringScope === 'all' ? 'Новое расписание' : 'Выберите новое время' }}
        </h3>

        <div class="flex items-center justify-between mb-3">
          <button type="button" class="btn btn-ghost btn-sm" @click="previousWeek">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <p class="text-sm font-medium">
            {{ weekDays[0]?.dateLabel }} — {{ weekDays[weekDays.length - 1]?.dateLabel }}
          </p>
          <button type="button" class="btn btn-ghost btn-sm" @click="nextWeek">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        <div role="tablist" class="tabs tabs-bordered mb-3">
          <button
            v-for="day in weekDays"
            :key="day.dayOfWeek"
            type="button"
            role="tab"
            :class="['tab', { 'tab-active': activeDay === String(day.dayOfWeek) }]"
            @click="activeDay = String(day.dayOfWeek)"
          >
            {{ day.short }}
          </button>
        </div>

        <div class="min-h-[140px]">
          <div v-if="loadingSlots" class="flex justify-center py-10">
            <span class="loading loading-spinner loading-md" />
          </div>
          <div v-else-if="isDayOff(Number(activeDay))" class="text-center text-base-content/40 py-10">
            Выходной день
          </div>
          <div v-else-if="availableSlots.length === 0" class="text-center text-base-content/40 py-10">
            Нет доступных слотов
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="slot in availableSlots"
              :key="`${slot.date}-${slot.startTime}`"
              type="button"
              :class="['btn btn-sm', selectedSlot?.startTime === slot.startTime && selectedSlot?.date === slot.date ? 'btn-primary' : 'btn-outline']"
              @click="selectedSlot = selectedSlot?.date === slot.date && selectedSlot?.startTime === slot.startTime ? null : slot"
            >
              {{ slot.startTime }} – {{ getSlotEndTime(slot.startTime) }}
            </button>
          </div>
        </div>

        <div v-if="selectedSlot" class="mt-3 p-3 bg-base-200 rounded-lg text-sm">
          {{ selectedDay?.short }}, {{ selectedDay?.dateLabel }} · {{ selectedSlot.startTime }} – {{ getSlotEndTime(selectedSlot.startTime) }}
        </div>

        <div class="modal-action">
          <button class="btn btn-ghost btn-sm" @click="view = lesson?.recurring ? 'reschedule-scope' : 'detail'">Назад</button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="!selectedSlot || loading"
            @click="recurringScope === 'all' ? handleRescheduleAll() : handleRescheduleSingle()"
          >
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            Перенести
          </button>
        </div>
      </template>

    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
