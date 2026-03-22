<script setup lang="ts">
import { computed, ref } from 'vue'

type DayColumn = {
  label: string
  date: string
  items: Array<{ time: string; title: string; meta: string; tone: string }>
}

const props = defineProps<{
  days: DayColumn[]
}>()

const viewMode = ref<'week' | 'day'>('week')
const visibleDays = computed(() => (viewMode.value === 'week' ? props.days : props.days.slice(0, 1)))
</script>

<template>
  <section class="card border border-base-200 bg-base-100 shadow-sm">
    <div class="card-body gap-4 p-0">
      <div class="flex items-center justify-between border-b border-base-200 px-5 py-4">
        <div>
          <p class="section-kicker">Календарь</p>
          <h2 class="mt-1 text-2xl font-bold">Рабочая неделя</h2>
        </div>

        <div aria-label="Режим календаря" class="tabs tabs-box" role="tablist">
          <button :aria-selected="viewMode === 'week'" :class="viewMode === 'week' ? 'tab tab-active' : 'tab'" role="tab" type="button" @click="viewMode = 'week'">Неделя</button>
          <button :aria-selected="viewMode === 'day'" :class="viewMode === 'day' ? 'tab tab-active' : 'tab'" role="tab" type="button" @click="viewMode = 'day'">День</button>
        </div>
      </div>

      <div class="grid min-w-0 gap-px bg-base-200" :class="viewMode === 'week' ? 'lg:grid-cols-5' : 'lg:grid-cols-1'">
        <article v-for="day in visibleDays" :key="day.label" class="min-w-0 bg-base-100 p-4">
          <header class="mb-4 border-b border-dashed border-base-300 pb-3">
            <p class="text-sm font-bold">{{ day.label }}</p>
            <p class="text-xs uppercase tracking-[0.2em] text-base-content/45">{{ day.date }}</p>
          </header>

          <div class="space-y-3">
            <article
              v-for="item in day.items"
              :key="`${day.label}-${item.time}-${item.title}`"
              class="card border border-base-200 bg-base-100 shadow-xs"
              :class="item.tone"
            >
              <div class="card-body gap-1 px-3 py-3">
                <p class="text-number text-xs font-bold uppercase tracking-[0.2em]">{{ item.time }}</p>
                <p class="truncate text-sm font-semibold">{{ item.title }}</p>
                <p class="text-xs leading-5 text-base-content/60">{{ item.meta }}</p>
              </div>
            </article>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
