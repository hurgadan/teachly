<script setup lang="ts">
const students = [
  { id: 'anna-petrova', name: 'Анна Петрова', level: 'B1', status: 'active', price: '₽2 400', debt: '₽4 800', nextLesson: 'Вт · 17:00', note: 'Нужны регулярные напоминания по домашнему заданию.' },
  { id: 'marat-ilyasov', name: 'Марат Ильясов', level: 'IELTS', status: 'active', price: '₽3 200', debt: '₽0', nextLesson: 'Вт · 12:00', note: 'Подготовка к экзамену, важен контроль дедлайнов.' },
  { id: 'olga-sokolova', name: 'Ольга Соколова', level: 'A2', status: 'paused', price: '₽2 000', debt: '₽2 000', nextLesson: 'Чт · 16:00', note: 'Часто переносит занятия, нужен быстрый доступ к расписанию.' },
]
</script>

<template>
  <div class="w-full min-w-0">
    <UiPageHeader
      title="Ученики"
      description="Список учеников, ближайшие занятия и сигналы по оплатам."
    >
      <div class="grid w-full gap-3 lg:w-auto lg:min-w-[26rem]">
        <button class="btn btn-primary w-full lg:justify-self-end" type="button">
          Добавить ученика
        </button>

        <form class="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" @submit.prevent>
          <input
            aria-label="Поиск по ученикам"
            autocomplete="off"
            class="input input-bordered w-full sm:min-w-72"
            name="students-search"
            placeholder="Поиск по имени или комментарию…"
            type="search"
          >

          <select aria-label="Фильтр статуса" class="select select-bordered" name="status">
            <option>Все статусы</option>
            <option>Активные</option>
            <option>На паузе</option>
          </select>
        </form>
      </div>
    </UiPageHeader>

    <section class="space-y-4">
      <section class="app-surface rounded-box px-4 py-3">
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <p><span class="font-semibold">21</span> активных</p>
          <p><span class="font-semibold">3</span> на паузе</p>
          <p><span class="font-semibold text-error">6</span> с долгом</p>
        </div>
      </section>

      <div class="space-y-4">
        <div class="grid gap-3 xl:hidden">
          <article v-for="student in students" :key="student.id" class="app-surface rounded-box">
            <div class="card-body gap-3 p-4">
            <div class="flex items-start justify-between gap-3">
              <NuxtLink :to="`/students/${student.id}`" class="min-w-0">
                <p class="truncate text-base font-semibold">{{ student.name }}</p>
              </NuxtLink>
              <span class="badge badge-primary badge-soft">{{ student.level }}</span>
            </div>

            <p class="app-muted mt-1 text-sm leading-6">{{ student.note }}</p>

            <dl class="grid gap-3">
              <div class="rounded-box border border-base-200/80 bg-base-100 p-3">
                <dt class="text-xs uppercase tracking-[0.18em] text-base-content/50">Следующий слот</dt>
                <dd class="text-number mt-2 text-sm font-semibold">{{ student.nextLesson }}</dd>
              </div>
            </dl>

            <div class="mt-4 flex items-center justify-between gap-3">
              <span class="text-sm text-base-content/65">{{ student.status === 'active' ? 'Активный ученик' : 'На паузе' }}</span>
              <span class="text-number text-sm font-bold" :class="student.debt === '₽0' ? 'text-success' : 'text-error'">
                {{ student.debt === '₽0' ? 'Без долга' : `Долг ${student.debt}` }}
              </span>
            </div>

            <div class="card-actions justify-end">
              <NuxtLink :to="`/students/${student.id}`" class="btn btn-sm btn-outline">Открыть профиль</NuxtLink>
            </div>
            </div>
          </article>
        </div>

        <div class="hidden overflow-hidden xl:block">
          <div class="overflow-x-auto">
          <table class="table app-surface rounded-box bg-base-100">
            <thead>
              <tr>
                <th>Ученик</th>
                <th>Уровень</th>
                <th>Следующее занятие</th>
                <th>Цена</th>
                <th>Долг</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id" class="hover">
                <td class="min-w-0">
                  <NuxtLink :to="`/students/${student.id}`" class="block min-w-0">
                    <div class="min-w-0">
                      <p class="truncate font-semibold">{{ student.name }}</p>
                      <p class="app-muted mt-1 line-clamp-2 text-sm leading-6">{{ student.note }}</p>
                    </div>
                  </NuxtLink>
                </td>
                <td>
                  <span class="badge badge-primary badge-soft text-primary">{{ student.level }}</span>
                </td>
                <td class="text-number whitespace-nowrap">{{ student.nextLesson }}</td>
                <td class="text-number whitespace-nowrap">{{ student.price }}</td>
                <td class="text-number whitespace-nowrap font-semibold" :class="student.debt === '₽0' ? 'text-success' : 'text-error'">
                  {{ student.debt }}
                </td>
                <td class="whitespace-nowrap text-right">
                  <NuxtLink :to="`/students/${student.id}`" class="btn btn-sm btn-outline">Профиль</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
