<script setup lang="ts">
const student = {
  name: 'Анна Петрова',
  level: 'B1',
  status: 'active',
  price: '2400',
  duration: '60',
  weeklyLessons: '2',
  email: 'anna.petrova@example.com',
  notes: 'Нужны регулярные напоминания по домашнему заданию.',
}

const lessons = [
  { date: '18 марта', status: 'Проведено', amount: '₽2 400' },
  { date: '14 марта', status: 'Проведено', amount: '₽2 400' },
  { date: '11 марта', status: 'Перенос', amount: '—' },
]

const payments = [
  { date: '5 марта', amount: '₽2 400' },
  { date: '20 февраля', amount: '₽2 400' },
]
</script>

<template>
  <div class="w-full min-w-0">
    <UiPageHeader
      :title="student.name"
      description="Редактирование профиля, расписания и финансового состояния ученика."
    >
      <div class="flex flex-wrap gap-3">
        <button class="btn btn-primary" type="button">
          Добавить в календарь
        </button>
        <button class="btn btn-outline" type="button">
          Зафиксировать оплату
        </button>
      </div>
    </UiPageHeader>

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div class="space-y-4">
        <article class="app-surface rounded-box">
          <div class="card-body p-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="section-kicker">Профиль</p>
                <h2 class="mt-1 text-3xl font-bold tracking-tight">Данные ученика</h2>
              </div>
              <span class="badge badge-success badge-soft">Активна</span>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <label class="form-control w-full">
                <span class="label-text mb-2">Имя</span>
                <input class="input input-bordered w-full" :value="student.name" type="text">
              </label>

              <label class="form-control w-full">
                <span class="label-text mb-2">Email</span>
                <input class="input input-bordered w-full" :value="student.email" type="email">
              </label>

              <label class="form-control w-full">
                <span class="label-text mb-2">Уровень</span>
                <select class="select select-bordered w-full">
                  <option>A1</option>
                  <option>A2</option>
                  <option selected>B1</option>
                  <option>B2</option>
                  <option>IELTS</option>
                </select>
              </label>

              <label class="form-control w-full">
                <span class="label-text mb-2">Цена занятия</span>
                <input class="input input-bordered w-full" :value="student.price" inputmode="numeric" type="text">
              </label>

              <label class="form-control w-full">
                <span class="label-text mb-2">Длительность, минут</span>
                <select class="select select-bordered w-full">
                  <option>45</option>
                  <option selected>60</option>
                  <option>90</option>
                </select>
              </label>

              <label class="form-control w-full">
                <span class="label-text mb-2">Занятий в неделю</span>
                <select class="select select-bordered w-full">
                  <option>1</option>
                  <option selected>2</option>
                  <option>3</option>
                </select>
              </label>

              <label class="form-control w-full">
                <span class="label-text mb-2">Статус</span>
                <select class="select select-bordered w-full">
                  <option selected>Активный</option>
                  <option>На паузе</option>
                  <option>Завершен</option>
                </select>
              </label>

              <label class="form-control md:col-span-2">
                <span class="label-text mb-2">Комментарий</span>
                <textarea class="textarea textarea-bordered min-h-28 w-full">{{ student.notes }}</textarea>
              </label>
            </div>

            <div class="card-actions mt-2 justify-start">
              <button class="btn btn-primary" type="button">Сохранить изменения</button>
            </div>
          </div>
        </article>

        <article class="app-surface rounded-box">
          <div class="card-body p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="section-kicker">История занятий</p>
              <h2 class="mt-1 text-3xl font-bold tracking-tight">Последние события</h2>
            </div>
            <NuxtLink class="link-hover text-sm font-semibold text-primary" to="/calendar">Открыть в календаре</NuxtLink>
          </div>

          <div class="mt-5 space-y-3">
            <article v-for="lesson in lessons" :key="lesson.date" class="rounded-box border border-base-200/80 bg-base-100">
              <div class="card-body flex-row items-center justify-between gap-4 px-4 py-4">
              <div>
                <p class="text-sm font-semibold">{{ lesson.date }}</p>
                <p class="app-muted mt-1 text-sm">{{ lesson.status }}</p>
              </div>
              <span class="text-number text-sm font-bold">{{ lesson.amount }}</span>
              </div>
            </article>
          </div>
          </div>
        </article>
      </div>

      <aside class="space-y-4">
        <section class="app-surface rounded-box">
          <div class="card-body">
          <p class="section-kicker">Следующие слоты</p>
          <h2 class="text-2xl font-bold tracking-tight">Ближайшие занятия</h2>
          <div class="mt-5 space-y-3">
            <article class="rounded-box border border-base-200/80 bg-base-100 px-4 py-3">
              <p class="text-number text-xs font-semibold uppercase tracking-[0.2em] text-primary">Вт · 17:00</p>
              <p class="mt-2 text-sm font-semibold">Разговорная практика</p>
            </article>
            <article class="rounded-box border border-base-200/80 bg-base-100 px-4 py-3">
              <p class="text-number text-xs font-semibold uppercase tracking-[0.2em] text-primary">Пт · 10:00</p>
              <p class="mt-2 text-sm font-semibold">Грамматика и разбор домашнего задания</p>
            </article>
          </div>
          </div>
        </section>

        <section class="app-surface rounded-box">
          <div class="card-body">
          <p class="section-kicker">История оплат</p>
          <h2 class="text-2xl font-bold tracking-tight">Последние платежи</h2>
          <div class="mt-5 space-y-3">
            <article v-for="payment in payments" :key="payment.date" class="rounded-box border border-base-200/80 bg-base-100">
              <div class="card-body flex-row items-center justify-between gap-3 px-4 py-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold">{{ payment.date }}</p>
                </div>
                <span class="text-number text-sm font-bold">{{ payment.amount }}</span>
              </div>
              </div>
            </article>
          </div>

          <div class="mt-4 rounded-box border border-error/20 bg-error/8 p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold">Текущая задолженность</p>
                <p class="text-number mt-1 text-lg font-bold text-error">₽4 800</p>
              </div>
              <button class="btn btn-sm btn-outline" type="button">Напомнить об оплате</button>
            </div>
          </div>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>
