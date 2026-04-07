<script setup lang="ts">
import type { AvailableSlot } from '~/types/calendar'
import type { Group } from '~/types/groups'
import type { Student } from '~/types/students'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const { createOneTimeLesson, createRecurringSchedule, getAvailableSlots } = useCalendarApi()
const { listGroups } = useGroupsApi()
const { listStudents } = useStudentsApi()
const { getMyWorkSchedule } = useUsersApi()
const { show } = useToast()

const form = reactive({
  type: 'student' as 'student' | 'group',
  studentId: '',
  groupId: '',
  duration: 60,
})

const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const loading = ref(false)
const loadingOptions = ref(false)
const loadingSlots = ref(false)
const mode = ref<'recurring' | 'one-time'>('one-time')
const students = ref<Student[]>([])
const groups = ref<Group[]>([])
const workSchedule = ref<Array<{ dayOfWeek: number; isWorkday: boolean }>>([])
const apiSlots = ref<AvailableSlot[]>([])
const selectedSlot = ref<AvailableSlot | null>(null)
const selectedSlots = ref<Array<{ date: string; dayOfWeek: number; startTime: string }>>([])
const weekStartDate = ref(getWeekStartDate())
const activeDay = ref('0')

const activeStudents = computed(() => students.value.filter((student) => student.status === 'active'))
const selectedStudent = computed(() =>
  activeStudents.value.find((student) => student.id === form.studentId) ?? null,
)
const selectedGroup = computed(() =>
  groups.value.find((group) => group.id === form.groupId) ?? null,
)
const weekDays = computed(() => buildWeekDays(weekStartDate.value))
const selectedDay = computed(() =>
  weekDays.value.find((day) => String(day.dayOfWeek) === activeDay.value) ?? null,
)
const availableSlots = computed(() =>
  apiSlots.value.filter((slot) => String(slot.dayOfWeek) === activeDay.value),
)

watch(() => props.open, async (isOpen) => {
  if (!isOpen) return

  resetForm()
  loadingOptions.value = true
  try {
    const [loadedStudents, loadedGroups, schedules] = await Promise.all([
      listStudents(),
      listGroups(),
      getMyWorkSchedule(),
    ])
    students.value = loadedStudents
    groups.value = loadedGroups
    workSchedule.value = schedules
    activeDay.value = String(weekDays.value[0]?.dayOfWeek ?? 0)
    await loadSlots()
  } finally {
    loadingOptions.value = false
  }
})

watch(() => form.type, () => {
  form.studentId = ''
  form.groupId = ''
  selectedSlot.value = null
  selectedSlots.value = []
})

watch(() => form.studentId, (studentId) => {
  if (!studentId || form.type !== 'student') {
    return
  }

  const student = selectedStudent.value
  if (student) {
    form.duration = student.duration
  }
  selectedSlot.value = null
  selectedSlots.value = []
  void loadSlots()
})

watch(() => form.groupId, (groupId) => {
  if (!groupId || form.type !== 'group') {
    return
  }

  const group = selectedGroup.value
  if (group) {
    form.duration = group.duration
  }
  selectedSlot.value = null
  selectedSlots.value = []
  void loadSlots()
})

watch(() => form.duration, async () => {
  if (!props.open) {
    return
  }

  selectedSlot.value = null
  selectedSlots.value = []
  await loadSlots()
})

async function handleSubmit() {
  const payload =
    form.type === 'student'
      ? { studentId: form.studentId }
      : { groupId: form.groupId }

  if (mode.value === 'one-time' && !selectedSlot.value) {
    return
  }

  if (mode.value === 'recurring' && selectedSlots.value.length === 0) {
    return
  }

  try {
    loading.value = true

    if (mode.value === 'one-time' && selectedSlot.value) {
      await createOneTimeLesson({
        ...payload,
        date: selectedSlot.value.date,
        startTime: selectedSlot.value.startTime,
        duration: form.duration,
      })
      show('Разовое занятие создано')
    } else {
      await createRecurringSchedule({
        ...payload,
        duration: form.duration,
        slots: selectedSlots.value,
      })
      show('Расписание сохранено')
    }

    emit('created')
    emit('close')
  } catch {
    show(mode.value === 'one-time' ? 'Ошибка при создании занятия' : 'Ошибка при сохранении расписания')
  } finally {
    loading.value = false
  }
}

async function loadSlots() {
  try {
    loadingSlots.value = true
    apiSlots.value = await getAvailableSlots(weekStartDate.value, form.duration)
  } finally {
    loadingSlots.value = false
  }
}

function previousWeek() {
  weekStartDate.value = shiftWeek(weekStartDate.value, -7)
  selectedSlot.value = null
  selectedSlots.value = []
  void loadSlots()
}

function nextWeek() {
  weekStartDate.value = shiftWeek(weekStartDate.value, 7)
  selectedSlot.value = null
  selectedSlots.value = []
  void loadSlots()
}

function isDayOff(dayOfWeek: number) {
  return workSchedule.value.some((day) => day.dayOfWeek === dayOfWeek && !day.isWorkday)
}

function isSlotSelected(slot: AvailableSlot) {
  return (
    selectedSlot.value?.date === slot.date &&
    selectedSlot.value?.dayOfWeek === slot.dayOfWeek &&
    selectedSlot.value?.startTime === slot.startTime
  )
}

function selectSlot(slot: AvailableSlot) {
  selectedSlot.value = isSlotSelected(slot) ? null : slot
}

function isRecurringSelected(slot: AvailableSlot) {
  return selectedSlots.value.some(
    (selected) =>
      selected.date === slot.date &&
      selected.dayOfWeek === slot.dayOfWeek &&
      selected.startTime === slot.startTime,
  )
}

function toggleRecurringSlot(slot: AvailableSlot) {
  const existingIndex = selectedSlots.value.findIndex(
    (selected) =>
      selected.date === slot.date &&
      selected.dayOfWeek === slot.dayOfWeek &&
      selected.startTime === slot.startTime,
  )

  if (existingIndex !== -1) {
    selectedSlots.value.splice(existingIndex, 1)
    return
  }

  selectedSlots.value.push({
    date: slot.date,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
  })
}

function selectedCountForDay(dayOfWeek: number) {
  return selectedSlots.value.filter((slot) => slot.dayOfWeek === dayOfWeek).length
}

function resetForm() {
  mode.value = 'one-time'
  form.type = 'student'
  form.studentId = ''
  form.groupId = ''
  form.duration = 60
  weekStartDate.value = getWeekStartDate()
  activeDay.value = '0'
  selectedSlot.value = null
  selectedSlots.value = []
}

function getWeekStartDate() {
  const current = new Date()
  const mondayOffset = current.getDay() === 0 ? -6 : 1 - current.getDay()
  current.setDate(current.getDate() + mondayOffset)
  return current.toISOString().slice(0, 10)
}

function shiftWeek(startDate: string, offsetDays: number) {
  const next = new Date(`${startDate}T00:00:00`)
  next.setDate(next.getDate() + offsetDays)
  return next.toISOString().slice(0, 10)
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
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-2xl">
      <h3 class="font-semibold text-lg mb-4">Добавить занятие</h3>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <div role="tablist" class="tabs tabs-box">
          <button
            type="button"
            role="tab"
            :class="['tab', { 'tab-active': mode === 'one-time' }]"
            @click="mode = 'one-time'"
          >
            Разово
          </button>
          <button
            type="button"
            role="tab"
            :class="['tab', { 'tab-active': mode === 'recurring' }]"
            @click="mode = 'recurring'"
          >
            Регулярно
          </button>
        </div>

        <div role="tablist" class="tabs tabs-bordered">
          <button type="button" role="tab" :class="['tab', { 'tab-active': form.type === 'student' }]" @click="form.type = 'student'">
            Ученик
          </button>
          <button type="button" role="tab" :class="['tab', { 'tab-active': form.type === 'group' }]" @click="form.type = 'group'">
            Группа
          </button>
        </div>

        <fieldset v-if="form.type === 'student'" class="fieldset">
          <legend class="fieldset-legend">Ученик *</legend>
          <select v-model="form.studentId" class="select select-bordered w-full" required>
            <option value="" disabled>Выберите</option>
            <option v-for="s in activeStudents" :key="s.id" :value="s.id">
              {{ s.firstName }} {{ s.lastName || '' }}
            </option>
          </select>
        </fieldset>

        <fieldset v-if="form.type === 'group'" class="fieldset">
          <legend class="fieldset-legend">Группа *</legend>
          <select v-model="form.groupId" class="select select-bordered w-full" required>
            <option value="" disabled>Выберите</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Длительность</legend>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="d in durationOptions"
              :key="d"
              type="button"
              :class="['btn btn-sm', form.duration === d ? 'btn-primary' : 'btn-outline']"
              @click="form.duration = d"
            >
              {{ d }} мин
            </button>
          </div>
        </fieldset>

        <div class="flex items-center justify-between">
          <button type="button" class="btn btn-ghost btn-sm" @click="previousWeek">
            Назад
          </button>
          <div class="text-center">
            <p class="font-medium">
              {{ weekDays[0]?.dateLabel }} — {{ weekDays[weekDays.length - 1]?.dateLabel }}
            </p>
            <p class="text-xs text-base-content/50">Выберите день и слот</p>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" @click="nextWeek">
            Вперёд
          </button>
        </div>

        <div role="tablist" class="tabs tabs-bordered">
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
              v-if="mode === 'recurring' && selectedCountForDay(day.dayOfWeek)"
              class="badge badge-xs badge-primary ml-1"
            >
              {{ selectedCountForDay(day.dayOfWeek) }}
            </span>
          </button>
        </div>

        <div class="min-h-[180px]">
          <div v-if="loadingOptions || loadingSlots" class="flex justify-center py-12">
            <span class="loading loading-spinner loading-md" />
          </div>
          <div v-else-if="isDayOff(Number(activeDay))" class="text-center text-base-content/40 py-12">
            Выходной день
          </div>
          <div v-else-if="availableSlots.length === 0" class="text-center text-base-content/40 py-12">
            Нет доступных слотов на {{ form.duration }} мин
          </div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="slot in availableSlots"
              :key="`${slot.date}-${slot.startTime}`"
              type="button"
              :class="[
                'btn',
                mode === 'one-time'
                  ? (isSlotSelected(slot) ? 'btn-primary' : 'btn-outline')
                  : (isRecurringSelected(slot) ? 'btn-primary' : 'btn-outline'),
              ]"
              @click="mode === 'one-time' ? selectSlot(slot) : toggleRecurringSlot(slot)"
            >
              {{ slot.startTime }} – {{ slot.endTime }}
            </button>
          </div>
        </div>

        <div v-if="mode === 'one-time' && selectedSlot" class="p-3 bg-base-200 rounded-lg">
          <p class="text-sm font-medium mb-1">Выбран слот:</p>
          <p class="text-sm text-base-content/70">
            {{ selectedDay?.short }}, {{ selectedDay?.dateLabel }} ·
            {{ selectedSlot.startTime }} – {{ selectedSlot.endTime }}
          </p>
        </div>

        <div v-if="mode === 'recurring' && selectedSlots.length > 0" class="p-3 bg-base-200 rounded-lg">
          <p class="text-sm font-medium mb-2">
            Выбрано {{ selectedSlots.length }}
            {{ selectedSlots.length === 1 ? 'занятие' : selectedSlots.length < 5 ? 'занятия' : 'занятий' }}
            в неделю:
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(slot, index) in selectedSlots"
              :key="`${slot.date}-${slot.startTime}-${index}`"
              class="badge badge-primary badge-lg"
            >
              {{ weekDays.find((day) => day.dayOfWeek === slot.dayOfWeek)?.short }} {{ slot.startTime }}
            </span>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="
              loading ||
              (mode === 'one-time' ? !selectedSlot : selectedSlots.length === 0) ||
              (form.type === 'student' ? !form.studentId : !form.groupId)
            "
          >
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            {{ mode === 'one-time' ? 'Создать' : 'Сохранить расписание' }}
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
