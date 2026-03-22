<script setup lang="ts">
const days = [
  {
    label: 'Пн',
    date: '23 марта',
    items: [
      { time: '10:00', title: 'Анна Петрова', meta: 'Занято', tone: 'border-primary/20 bg-primary/8' },
      { time: '12:30', title: 'Свободный слот', meta: 'Доступен для нового ученика', tone: 'border-dashed border-base-content/18 bg-base-200/80' },
      { time: '18:30', title: 'Evening A2', meta: 'Группа', tone: 'border-secondary/30 bg-secondary/12' },
    ],
  },
  {
    label: 'Вт',
    date: '24 марта',
    items: [
      { time: '09:00', title: 'Буфер', meta: '15 минут после утреннего слота', tone: 'border-warning/28 bg-warning/16' },
      { time: '17:00', title: 'Анна Петрова', meta: 'Повторяющееся занятие', tone: 'border-primary/20 bg-primary/8' },
    ],
  },
  {
    label: 'Ср',
    date: '25 марта',
    items: [
      { time: '11:30', title: 'Teens B1', meta: 'Материализованный экземпляр серии', tone: 'border-secondary/30 bg-secondary/12' },
    ],
  },
  {
    label: 'Чт',
    date: '26 марта',
    items: [
      { time: '16:00', title: 'Ольга Соколова', meta: 'Перенос запрошен', tone: 'border-accent/25 bg-accent/10' },
    ],
  },
  {
    label: 'Пт',
    date: '27 марта',
    items: [
      { time: '10:00', title: 'Анна Петрова', meta: 'Потенциальный перенос', tone: 'border-success/28 bg-success/12' },
    ],
  },
]
</script>

<template>
  <div class="w-full min-w-0">
    <UiPageHeader
      title="Календарь"
    >
      <div class="flex flex-wrap gap-3">
        <button class="btn btn-primary" type="button">Свободные окна</button>
        <button class="btn btn-outline" type="button">Текущая неделя</button>
      </div>
    </UiPageHeader>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
      <UiCalendarWeek :days="days" />

      <aside class="space-y-4">
        <section class="card border border-base-200 bg-base-100 shadow-sm">
          <div class="card-body">
          <p class="section-kicker">Легенда состояний</p>
          <h2 class="text-2xl font-bold">Состояния</h2>
          <div class="mt-5 space-y-3">
            <article class="alert border-primary/30 bg-primary/10 text-primary-content">Повторяющееся занятие</article>
            <article class="alert border-warning/40 bg-warning/15 text-warning-content">Буфер после занятия</article>
            <article class="alert border-success/35 bg-success/10 text-success-content">Свободный слот</article>
            <article class="alert border-error/35 bg-error/10 text-error-content">Исключение или перенос</article>
          </div>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>
