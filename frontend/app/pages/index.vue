<script setup lang="ts">
const stats = [
  { label: 'Занятий на неделе', value: '18', detail: '13 индивидуальных и 5 групповых занятий.', tone: 'primary' as const },
  { label: 'Ожидается оплат', value: '₽42 600', detail: '7 оплат запланированы до конца недели.', tone: 'secondary' as const },
  { label: 'Текущая задолженность', value: '₽9 200', detail: '6 учеников требуют проверки оплаты.', tone: 'accent' as const },
]

const days = [
  {
    label: 'Пн',
    date: '23 марта',
    items: [
      { time: '10:00', title: 'Анна Петрова', meta: 'Индивидуально · B1 · 60 мин', tone: 'border-primary/20 bg-primary/8' },
      { time: '18:30', title: 'Группа Evening A2', meta: '4 ученика · 90 мин', tone: 'border-secondary/30 bg-secondary/12' },
    ],
  },
  {
    label: 'Вт',
    date: '24 марта',
    items: [
      { time: '12:00', title: 'Марат Ильясов', meta: 'Подготовка к IELTS · 60 мин', tone: 'border-accent/25 bg-accent/10' },
      { time: '17:00', title: 'Анна Петрова', meta: 'Разговорная практика · 60 мин', tone: 'border-primary/20 bg-primary/8' },
    ],
  },
  {
    label: 'Ср',
    date: '25 марта',
    items: [
      { time: '11:30', title: 'Группа Teens B1', meta: '5 учеников · 80 мин', tone: 'border-secondary/30 bg-secondary/12' },
    ],
  },
  {
    label: 'Чт',
    date: '26 марта',
    items: [
      { time: '16:00', title: 'Ольга Соколова', meta: 'Индивидуально · A2 · 45 мин', tone: 'border-primary/20 bg-primary/8' },
      { time: '19:15', title: 'Разовый слот', meta: 'Свободно для переноса или доп. занятия', tone: 'border-dashed border-base-content/20 bg-base-200/65' },
    ],
  },
  {
    label: 'Пт',
    date: '27 марта',
    items: [
      { time: '09:30', title: 'Кирилл Миронов', meta: 'Индивидуально · B2 · 60 мин', tone: 'border-primary/20 bg-primary/8' },
    ],
  },
]

const debtors = [
  { name: 'Анна Петрова', amount: '₽4 800', note: '2 проведенных занятия, платеж до 25 марта' },
  { name: 'Группа Evening A2', amount: '₽2 400', note: 'Не оплачены 2 места за текущую неделю' },
  { name: 'Ольга Соколова', amount: '₽2 000', note: 'Оплата за перенесенное занятие еще не поступила' },
]
</script>

<template>
  <div class="w-full min-w-0">
    <UiPageHeader
      title="Рабочая неделя"
    >
      <NuxtLink class="btn btn-primary" to="/calendar">Открыть календарь</NuxtLink>
    </UiPageHeader>

    <section class="dashboard-grid">
      <div v-for="stat in stats" :key="stat.label" class="col-span-12 md:col-span-4">
        <UiStatCard :detail="stat.detail" :label="stat.label" :tone="stat.tone" :value="stat.value" />
      </div>

      <div class="dashboard-main">
        <UiCalendarWeek :days="days" />
      </div>

      <aside class="dashboard-side space-y-4">
        <section class="card border border-base-200 bg-base-100 shadow-sm">
          <div class="card-body">
          <p class="section-kicker">Сегодня</p>
          <h2 class="text-2xl font-bold">Изменения в расписании</h2>

          <div class="space-y-3">
            <article class="alert bg-warning/10 text-warning-content">
              <div>
              <p class="text-sm font-semibold">Сегодня 16:00</p>
              <p class="mt-1 text-sm text-base-content/72">Ольга Соколова просит перенести занятие на пятницу, 10:00.</p>
              </div>
            </article>

            <article class="alert bg-info/10 text-info-content">
              <div>
              <p class="text-sm font-semibold">Свободное окно 19:15</p>
              <p class="mt-1 text-sm text-base-content/72">Окно доступно для переноса или разового занятия.</p>
              </div>
            </article>
          </div>
          </div>
        </section>

        <section class="card border border-base-200 bg-base-100 shadow-sm">
          <div class="card-body">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold">Напоминания об оплате</h2>
            </div>
            <NuxtLink class="link-hover text-sm font-semibold text-primary" to="/payments">Все оплаты</NuxtLink>
          </div>

          <div class="space-y-3">
            <article v-for="person in debtors" :key="person.name" class="card card-border bg-base-100">
              <div class="card-body gap-2 px-4 py-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{{ person.name }}</p>
                  <p class="mt-1 text-sm leading-6 text-base-content/65">{{ person.note }}</p>
                </div>
                <span class="text-number shrink-0 whitespace-nowrap text-sm font-bold text-error">{{ person.amount }}</span>
              </div>
              </div>
            </article>
          </div>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>
