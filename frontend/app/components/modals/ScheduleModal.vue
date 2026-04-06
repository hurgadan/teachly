<script setup lang="ts">
const props = defineProps<{
  open: boolean
  entityName: string
  defaultDuration: number
}>()
const emit = defineEmits<{ close: []; saved: [] }>()

const { workSchedule, weekLessons } = useMockData()
const { show } = useToast()

const loading = ref(false)

// Duration selector: 30–90, step 15, pre-filled from entity profile
const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const duration = ref(props.defaultDuration)

watch(() => props.defaultDuration, (val) => {
  duration.value = val
})
watch(() => props.open, (val) => {
  if (val) {
    duration.value = props.defaultDuration
    selectedSlots.value = []
  }
})

// Selected slots
const selectedSlots = ref<{ day: string; dayShort: string; from: string; to: string }[]>([])

const weekDays = [
  { key: 'Понедельник', short: 'Пн', dateStr: '2026-04-06' },
  { key: 'Вторник', short: 'Вт', dateStr: '2026-04-07' },
  { key: 'Среда', short: 'Ср', dateStr: '2026-04-08' },
  { key: 'Четверг', short: 'Чт', dateStr: '2026-04-09' },
  { key: 'Пятница', short: 'Пт', dateStr: '2026-04-10' },
  { key: 'Суббота', short: 'Сб', dateStr: '2026-04-11' },
]

const activeDay = ref(weekDays[0].key)

function formatTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Compute available full-duration slots for the active day
const availableSlots = computed(() => {
  const daySchedule = workSchedule.find(d => d.day === activeDay.value)
  if (!daySchedule || !daySchedule.enabled) return []

  const dayInfo = weekDays.find(d => d.key === activeDay.value)
  const dayLessons = dayInfo ? weekLessons.filter(l => l.date === dayInfo.dateStr) : []
  const bufferMin = 15 // buffer after each lesson

  // Build list of occupied time ranges (lesson start → lesson end + buffer)
  const occupied = dayLessons.map(l => {
    const [lh, lm] = l.time.split(':').map(Number)
    return { start: lh * 60 + lm, end: lh * 60 + lm + l.duration + bufferMin }
  })

  const slots: { from: string; to: string }[] = []
  const dur = duration.value

  for (const interval of daySchedule.intervals) {
    const [startH, startM] = interval.from.split(':').map(Number)
    const [endH, endM] = interval.to.split(':').map(Number)
    const intervalStart = startH * 60 + startM
    const intervalEnd = endH * 60 + endM

    // Slide through the interval in 15-min steps
    for (let t = intervalStart; t + dur <= intervalEnd; t += 15) {
      const slotEnd = t + dur

      // Check no conflict with occupied ranges
      const conflict = occupied.some(o => t < o.end && slotEnd > o.start)
      if (!conflict) {
        slots.push({ from: formatTime(t), to: formatTime(slotEnd) })
      }
    }
  }

  return slots
})

function isSelected(from: string, to: string) {
  return selectedSlots.value.some(s => s.day === activeDay.value && s.from === from && s.to === to)
}

function toggleSlot(from: string, to: string) {
  const idx = selectedSlots.value.findIndex(s => s.day === activeDay.value && s.from === from && s.to === to)
  if (idx !== -1) {
    selectedSlots.value.splice(idx, 1)
  } else {
    const dayInfo = weekDays.find(d => d.key === activeDay.value)
    selectedSlots.value.push({
      day: activeDay.value,
      dayShort: dayInfo?.short || '',
      from,
      to,
    })
  }
}

function removeSlot(index: number) {
  selectedSlots.value.splice(index, 1)
}

function selectedCountForDay(dayKey: string) {
  return selectedSlots.value.filter(s => s.day === dayKey).length
}

async function handleSave() {
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  show(`Расписание для «${props.entityName}» сохранено (${selectedSlots.value.length} занятий в неделю)`)
  emit('saved')
  emit('close')
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

      <!-- Day tabs -->
      <div role="tablist" class="tabs tabs-bordered mb-4">
        <button
          v-for="day in weekDays"
          :key="day.key"
          type="button"
          role="tab"
          :class="['tab', { 'tab-active': activeDay === day.key }]"
          @click="activeDay = day.key"
        >
          {{ day.short }}
          <span
            v-if="selectedCountForDay(day.key)"
            class="badge badge-xs badge-primary ml-1"
          >
            {{ selectedCountForDay(day.key) }}
          </span>
        </button>
      </div>

      <!-- Available slots -->
      <div class="min-h-[180px]">
        <div
          v-if="workSchedule.find(d => d.day === activeDay)?.enabled === false"
          class="text-center text-base-content/40 py-12"
        >
          Выходной день
        </div>
        <div v-else-if="availableSlots.length === 0" class="text-center text-base-content/40 py-12">
          Нет доступных слотов на {{ duration }} мин
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            v-for="slot in availableSlots"
            :key="slot.from"
            type="button"
            :class="[
              'btn',
              isSelected(slot.from, slot.to) ? 'btn-primary' : 'btn-outline',
            ]"
            @click="toggleSlot(slot.from, slot.to)"
          >
            {{ slot.from }} – {{ slot.to }}
          </button>
        </div>
      </div>

      <!-- Selected summary -->
      <div v-if="selectedSlots.length > 0" class="mt-5 p-3 bg-base-200 rounded-lg">
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
            {{ slot.dayShort }} {{ slot.from }}–{{ slot.to }}
            <button type="button" class="text-primary-content/70 hover:text-primary-content" @click="removeSlot(i)">×</button>
          </span>
        </div>
      </div>

      <div class="modal-action">
        <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="loading || selectedSlots.length === 0"
          @click="handleSave"
        >
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          Сохранить расписание
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
