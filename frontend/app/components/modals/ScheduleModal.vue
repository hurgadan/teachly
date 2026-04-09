<script setup lang="ts">
import type { AvailableSlot, RecurringLessonSlot } from '~/types/calendar'

const props = defineProps<{
  open: boolean
  entityName: string
  entityId: string
  entityType: 'student' | 'group'
  defaultDuration: number
}>()
const emit = defineEmits<{ close: []; saved: [] }>()

const { createLesson, createRecurringLesson, getAvailableSlots } = useCalendarApi()
const { getMyWorkSchedule } = useUsersApi()
const { show } = useToast()

const loading = ref(false)
const loadingSlots = ref(false)
const loadingSchedule = ref(false)
const mode = ref<'recurring' | 'one-time'>('recurring')

// Duration selector: 30–90, step 15, pre-filled from entity profile
const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const duration = ref(props.defaultDuration)

const weekStartDate = ref(getWeekStartDate())
const workSchedule = ref<Array<{ dayOfWeek: number; isWorkday: boolean }>>([])
const apiSlots = ref<AvailableSlot[]>([])
const selectedSlots = ref<RecurringLessonSlot[]>([])
const selectedOneTimeSlot = ref<AvailableSlot | null>(null)

watch(() => props.defaultDuration, (val) => {
  duration.value = val
})
watch([() => props.open, duration], async ([isOpen]) => {
  if (!isOpen) {
    return
  }

  duration.value = props.defaultDuration
  selectedSlots.value = []
  selectedOneTimeSlot.value = null
  await loadModalData()
})

watch(() => props.open, (val) => {
  if (val) {
    mode.value = 'recurring'
    duration.value = props.defaultDuration
    selectedSlots.value = []
    selectedOneTimeSlot.value = null
  }
})

const weekDays = computed(() => buildWeekDays(weekStartDate.value))

const activeDay = ref('0')

const availableSlots = computed(() =>
  apiSlots.value.filter((slot) => String(slot.dayOfWeek) === activeDay.value),
)
const selectedDay = computed(() =>
  weekDays.value.find((day) => String(day.dayOfWeek) === activeDay.value) ?? null,
)

function isSelected(slot: AvailableSlot) {
  return selectedSlots.value.some(
    (selected) =>
      selected.dayOfWeek === slot.dayOfWeek &&
      selected.date === slot.date &&
      selected.startTime === slot.startTime,
  )
}

function toggleSlot(slot: AvailableSlot) {
  const idx = selectedSlots.value.findIndex(
    (selected) =>
      selected.dayOfWeek === slot.dayOfWeek &&
      selected.date === slot.date &&
      selected.startTime === slot.startTime,
  )

  if (idx !== -1) {
    selectedSlots.value.splice(idx, 1)
  } else {
    selectedSlots.value.push({
      date: slot.date,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
    })
  }
}

function isOneTimeSelected(slot: AvailableSlot) {
  return (
    selectedOneTimeSlot.value?.date === slot.date &&
    selectedOneTimeSlot.value?.dayOfWeek === slot.dayOfWeek &&
    selectedOneTimeSlot.value?.startTime === slot.startTime
  )
}

function selectOneTimeSlot(slot: AvailableSlot) {
  selectedOneTimeSlot.value = isOneTimeSelected(slot) ? null : slot
}

function removeSlot(index: number) {
  selectedSlots.value.splice(index, 1)
}

function selectedCountForDay(dayOfWeek: number) {
  return selectedSlots.value.filter((slot) => slot.dayOfWeek === dayOfWeek).length
}

async function handleSave() {
  try {
    loading.value = true

    if (mode.value === 'one-time') {
      if (!selectedOneTimeSlot.value) {
        return
      }

      await createLesson({
        duration: duration.value,
        date: selectedOneTimeSlot.value.date,
        startTime: selectedOneTimeSlot.value.startTime,
        ...(props.entityType === 'student' ? { studentId: props.entityId } : { groupId: props.entityId }),
      })
      show(`Разовое занятие для «${props.entityName}» создано`)
    } else {
      await createRecurringLesson({
        duration: duration.value,
        ...(props.entityType === 'student' ? { studentId: props.entityId } : { groupId: props.entityId }),
        slots: selectedSlots.value,
      })
      show(`Расписание для «${props.entityName}» сохранено`)
    }

    emit('saved')
    emit('close')
  } catch {
    show(mode.value === 'one-time' ? 'Ошибка при создании разового занятия' : 'Ошибка при сохранении расписания')
  } finally {
    loading.value = false
  }
}

async function loadModalData() {
  try {
    loadingSchedule.value = true
    loadingSlots.value = true
    const [schedules, slots] = await Promise.all([
      getMyWorkSchedule(),
      getAvailableSlots(weekStartDate.value, duration.value),
    ])
    workSchedule.value = schedules
    apiSlots.value = slots
    activeDay.value = String(weekDays.value[0]?.dayOfWeek ?? 0)
  } finally {
    loadingSchedule.value = false
    loadingSlots.value = false
  }
}

function getDayLabel(dayOfWeek: number) {
  return weekDays.value.find((day) => day.dayOfWeek === dayOfWeek)?.short ?? ''
}

function isDayOff(dayOfWeek: number) {
  return workSchedule.value.some((day) => day.dayOfWeek === dayOfWeek && !day.isWorkday)
}

function getSlotEndTime(startTime: string) {
  return minutesToTime(timeToMinutes(startTime) + duration.value)
}

function getWeekStartDate() {
  const current = new Date()
  const mondayOffset = current.getDay() === 0 ? -6 : 1 - current.getDay()
  current.setDate(current.getDate() + mondayOffset)
  return current.toISOString().slice(0, 10)
}

function buildWeekDays(startDate: string) {
  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${startDate}T00:00:00`)
    date.setDate(date.getDate() + index)
    return {
      short: labels[index],
      dateStr: date.toISOString().slice(0, 10),
      dateLabel: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      dayOfWeek: index,
    }
  })
}

function timeToMinutes(value: string) {
  const parts = value.split(':').map(Number)
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-2xl">
      <h3 class="font-semibold text-lg mb-1">Формирование расписания</h3>
      <p class="text-sm text-base-content/60 mb-5">{{ entityName }}</p>

      <!-- Duration selector -->
      <div class="mb-5">
        <p class="text-sm font-medium mb-2">Длительность занятия</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="d in durationOptions"
            :key="d"
            type="button"
            :class="['btn btn-sm', duration === d ? 'btn-primary' : 'btn-outline']"
            @click="duration = d"
          >
            {{ d }} мин
          </button>
        </div>
      </div>

      <div role="tablist" class="tabs tabs-box mb-5">
        <button
          type="button"
          role="tab"
          :class="['tab', { 'tab-active': mode === 'recurring' }]"
          @click="mode = 'recurring'"
        >
          Регулярно
        </button>
        <button
          type="button"
          role="tab"
          :class="['tab', { 'tab-active': mode === 'one-time' }]"
          @click="mode = 'one-time'"
        >
          Разово
        </button>
      </div>

      <!-- Day tabs -->
      <div role="tablist" class="tabs tabs-bordered mb-4">
        <button
          v-for="day in weekDays"
          :key="day.dayOfWeek"
          type="button"
          role="tab"
          :class="['tab', { 'tab-active': activeDay === String(day.dayOfWeek) }]"
          @click="activeDay = String(day.dayOfWeek)"
        >
          {{ day.short }}
          <span
            v-if="selectedCountForDay(day.dayOfWeek)"
            class="badge badge-xs badge-primary ml-1"
          >
            {{ selectedCountForDay(day.dayOfWeek) }}
          </span>
        </button>
      </div>

      <!-- Available slots -->
      <div class="min-h-[180px]">
        <div v-if="loadingSlots || loadingSchedule" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-md" />
        </div>
        <div v-else-if="isDayOff(Number(activeDay))" class="text-center text-base-content/40 py-12">
          Выходной день
        </div>
        <div v-else-if="availableSlots.length === 0" class="text-center text-base-content/40 py-12">
          Нет доступных слотов на {{ duration }} мин
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="slot in availableSlots"
            :key="`${slot.date}-${slot.startTime}`"
            type="button"
            :class="[
              'btn',
              mode === 'one-time'
                ? (isOneTimeSelected(slot) ? 'btn-primary' : 'btn-outline')
                : (isSelected(slot) ? 'btn-primary' : 'btn-outline'),
            ]"
            @click="mode === 'one-time' ? selectOneTimeSlot(slot) : toggleSlot(slot)"
          >
            {{ slot.startTime }} – {{ getSlotEndTime(slot.startTime) }}
          </button>
        </div>
      </div>

      <!-- Selected summary -->
      <div v-if="mode === 'recurring' && selectedSlots.length > 0" class="mt-5 p-3 bg-base-200 rounded-lg">
        <p class="text-sm font-medium mb-2">
          Выбрано {{ selectedSlots.length }}
          {{ selectedSlots.length === 1 ? 'занятие' : selectedSlots.length < 5 ? 'занятия' : 'занятий' }}
          в неделю:
        </p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(slot, i) in selectedSlots"
            :key="i"
            class="badge badge-primary badge-lg gap-1"
          >
            {{ getDayLabel(slot.dayOfWeek) }} {{ slot.startTime }}
            <button type="button" class="text-primary-content/70 hover:text-primary-content" @click="removeSlot(i)">×</button>
          </span>
        </div>
      </div>

      <div v-if="mode === 'one-time' && selectedOneTimeSlot" class="mt-5 p-3 bg-base-200 rounded-lg">
        <p class="text-sm font-medium mb-1">Выбран слот для разового занятия:</p>
        <p class="text-sm text-base-content/70">
          {{ selectedDay?.short }}, {{ selectedDay?.dateLabel }} ·
          {{ selectedOneTimeSlot.startTime }} – {{ getSlotEndTime(selectedOneTimeSlot.startTime) }}
        </p>
      </div>

      <div class="modal-action">
        <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || (mode === 'one-time' ? !selectedOneTimeSlot : selectedSlots.length === 0)"
          @click="handleSave"
        >
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          {{ mode === 'one-time' ? 'Создать занятие' : 'Сохранить расписание' }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
