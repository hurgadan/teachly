<script setup lang="ts">
import type { Lesson } from '~/types/calendar'

const { getWeekLessons } = useCalendarApi()
const showCreateLesson = ref(false)
const { show } = useToast()
const currentWeekStart = ref(getWeekStart())
const weekLessons = ref<Lesson[]>([])
const loading = ref(true)

const weekDays = computed(() => buildWeekDays(currentWeekStart.value))

const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 — 20:00
const HOUR_HEIGHT = 64 // px per hour (h-16)

const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

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

function getDayLessons(dateStr: string) {
  return weekLessons.value.filter(lesson => getLocalDateStr(lesson.startAt) === dateStr)
}

function getLessonStyle(lesson: { startAt: string; duration: number }) {
  const parts = getLocalTimeStr(lesson.startAt).split(':').map(Number)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  const top = (h - 8) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT
  const height = (lesson.duration / 60) * HOUR_HEIGHT
  return { top: `${top}px`, height: `${height}px` }
}

const lessonColors: Record<string, string> = {
  completed: 'bg-success/15 border-success/30 text-success',
  scheduled: 'bg-primary/10 border-primary/30 text-primary',
  cancelled: 'bg-error/10 border-error/30 text-error',
}

onMounted(() => {
  void loadWeek()
})

async function loadWeek() {
  try {
    loading.value = true
    weekLessons.value = await getWeekLessons(currentWeekStart.value)
  } catch {
    show('Ошибка при загрузке календаря')
  } finally {
    loading.value = false
  }
}

function previousWeek() {
  currentWeekStart.value = shiftWeek(currentWeekStart.value, -7)
  void loadWeek()
}

function nextWeek() {
  currentWeekStart.value = shiftWeek(currentWeekStart.value, 7)
  void loadWeek()
}

function onLessonCreated() {
  showCreateLesson.value = false
  void loadWeek()
}

function getWeekStart() {
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
      label: labels[index],
      date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      dateStr: date.toISOString().slice(0, 10),
    }
  })
}
</script>

<template>
  <div>
    <UiPageHeader title="Календарь">
      <template #actions>
        <button class="btn btn-primary btn-sm" @click="showCreateLesson = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Разовое занятие
        </button>
      </template>
    </UiPageHeader>

    <!-- Week navigation -->
    <div class="flex items-center justify-between mb-4">
      <button class="btn btn-ghost btn-sm" @click="previousWeek">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <div class="text-center">
        <p class="font-semibold">
          {{ weekDays[0]?.date }} — {{ weekDays[weekDays.length - 1]?.date }}
        </p>
        <p class="text-xs text-base-content/50">Неделя</p>
      </div>
      <button class="btn btn-ghost btn-sm" @click="nextWeek">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Desktop: Week grid -->
    <div v-else class="hidden lg:block card bg-base-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <div class="grid min-w-[920px]" :style="{ gridTemplateColumns: '4rem repeat(7, 1fr)' }">
          <!-- Header row -->
          <div class="sticky top-0 z-20 bg-base-100 border-b border-base-300 h-12" />
          <div
            v-for="day in weekDays"
            :key="day.dateStr"
            class="sticky top-0 z-20 bg-base-100 border-b border-l border-base-300 h-12 flex flex-col items-center justify-center"
          >
            <span class="text-xs text-base-content/50">{{ day.label }}</span>
            <span class="text-sm font-medium">{{ day.date }}</span>
          </div>

          <!-- Time column -->
          <div class="relative">
            <div v-for="hour in hours" :key="hour" class="h-16 relative">
              <span class="absolute -top-2.5 right-2 text-[11px] text-base-content/40 font-mono">
                {{ String(hour).padStart(2, '0') }}:00
              </span>
            </div>
          </div>

          <!-- Day columns -->
          <div
            v-for="day in weekDays"
            :key="`col-${day.dateStr}`"
            class="relative border-l border-base-300"
          >
            <!-- Hour grid lines -->
            <div
              v-for="hour in hours"
              :key="hour"
              class="h-16 border-b border-base-200"
            />

            <!-- Lesson blocks -->
            <div
              v-for="lesson in getDayLessons(day.dateStr)"
              :key="lesson.id"
              :class="['absolute left-0.5 right-0.5 rounded border text-xs p-1.5 overflow-hidden cursor-pointer hover:shadow-md transition-shadow', lessonColors[lesson.status]]"
              :style="getLessonStyle({ startAt: lesson.startAt, duration: lesson.duration })"
            >
              <p class="font-medium truncate leading-tight">{{ lesson.title }}</p>
              <p class="opacity-60 text-[10px] mt-0.5">{{ getLocalTimeStr(lesson.startAt) }} · {{ lesson.duration }} мин</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile: Day list -->
    <div v-if="!loading" class="lg:hidden space-y-4">
      <div v-for="day in weekDays" :key="day.dateStr">
        <h3 class="text-sm font-semibold mb-2">{{ day.label }}, {{ day.date }}</h3>
        <div v-if="getDayLessons(day.dateStr).length === 0" class="text-sm text-base-content/40 py-2">
          Нет занятий
        </div>
        <div v-else class="space-y-1.5">
          <div
            v-for="lesson in getDayLessons(day.dateStr)"
            :key="lesson.id"
            class="card bg-base-100 shadow-sm"
          >
            <div class="card-body p-3 flex-row items-center gap-3">
              <div class="text-sm font-mono font-medium w-12 shrink-0 text-base-content/60">
                {{ getLocalTimeStr(lesson.startAt) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ lesson.title }}</p>
                <p class="text-xs text-base-content/50">{{ lesson.duration }} мин</p>
              </div>
              <span
                v-if="lesson.status === 'completed'"
                class="badge badge-xs badge-success"
              >Проведено</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalsCreateLessonModal :open="showCreateLesson" @close="showCreateLesson = false" @created="onLessonCreated" />
  </div>
</template>
