<script setup lang="ts">
const weeklyAvailability = [
  {
    day: 'Понедельник',
    enabled: true,
    intervals: [
      { start: '09:00', end: '12:30' },
      { start: '14:00', end: '18:00' },
    ],
  },
  {
    day: 'Вторник',
    enabled: true,
    intervals: [
      { start: '10:00', end: '13:00' },
      { start: '15:00', end: '20:00' },
    ],
  },
  {
    day: 'Среда',
    enabled: true,
    intervals: [
      { start: '09:00', end: '11:30' },
      { start: '16:00', end: '19:00' },
    ],
  },
  {
    day: 'Четверг',
    enabled: false,
    intervals: [],
  },
  {
    day: 'Пятница',
    enabled: true,
    intervals: [{ start: '09:00', end: '14:00' }],
  },
  {
    day: 'Суббота',
    enabled: true,
    intervals: [{ start: '11:00', end: '15:00' }],
  },
  {
    day: 'Воскресенье',
    enabled: false,
    intervals: [],
  },
]
</script>

<template>
  <div class="w-full min-w-0">
    <UiPageHeader title="Профиль преподавателя" />

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
      <section class="card border border-base-200 bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">Профиль</h2>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="form-control w-full">
              <span class="label-text mb-2">Имя</span>
              <input class="input input-bordered w-full" type="text" value="Елена Иванова">
            </label>

            <label class="form-control w-full">
              <span class="label-text mb-2">Телефон</span>
              <input class="input input-bordered w-full" type="tel" value="+7 999 234-56-78">
            </label>

            <label class="form-control w-full">
              <span class="label-text mb-2">Часовой пояс</span>
              <select class="select select-bordered w-full">
                <option selected>Europe/Berlin</option>
                <option>Europe/Moscow</option>
                <option>Asia/Almaty</option>
              </select>
            </label>

            <label class="form-control w-full">
              <span class="label-text mb-2">Язык интерфейса</span>
              <select class="select select-bordered w-full">
                <option selected>Русский</option>
                <option>English</option>
              </select>
            </label>

            <label class="form-control md:col-span-2">
              <span class="label-text mb-2">Коротко о себе</span>
              <textarea class="textarea textarea-bordered min-h-28 w-full">Английский для взрослых и подростков, индивидуальные занятия и мини-группы.</textarea>
            </label>
          </div>

          <div class="card-actions justify-start">
            <button class="btn btn-primary" type="button">Сохранить профиль</button>
          </div>
        </div>
      </section>

      <section class="card border border-base-200 bg-base-100 shadow-sm">
        <div class="card-body">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="card-title">Доступность по дням недели</h2>
              <p class="text-sm text-base-content/70">Для каждого дня можно задать отдельные рабочие интервалы.</p>
            </div>
            <button class="btn btn-outline btn-sm" type="button">Добавить шаблон</button>
          </div>

          <div class="space-y-3">
            <article
              v-for="day in weeklyAvailability"
              :key="day.day"
              class="card card-border bg-base-100"
            >
              <div class="card-body gap-3 p-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <label class="label cursor-pointer justify-start gap-3 p-0">
                    <input :checked="day.enabled" class="toggle toggle-primary" type="checkbox">
                    <span class="font-semibold">{{ day.day }}</span>
                  </label>

                  <button class="btn btn-ghost btn-sm" type="button" :disabled="!day.enabled">
                    Добавить интервал
                  </button>
                </div>

                <div v-if="day.enabled" class="flex flex-wrap gap-2">
                  <div
                    v-for="interval in day.intervals"
                    :key="`${day.day}-${interval.start}-${interval.end}`"
                    class="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]"
                  >
                    <input class="input input-bordered input-sm w-full" :value="interval.start" step="900" type="time">
                    <span class="self-center text-center text-sm text-base-content/60">—</span>
                    <input class="input input-bordered input-sm w-full" :value="interval.end" step="900" type="time">
                    <button class="btn btn-ghost btn-sm" type="button">Удалить</button>
                  </div>
                </div>

                <p v-else class="text-sm text-base-content/60">Недоступен для записи.</p>
              </div>
            </article>
          </div>

          <label class="form-control mt-4 w-full">
            <span class="label-text mb-2">Буфер после занятия</span>
            <select class="select select-bordered w-full">
              <option>0 минут</option>
              <option selected>15 минут</option>
              <option>30 минут</option>
            </select>
          </label>

          <div class="card-actions justify-start">
            <button class="btn btn-primary" type="button">Сохранить график</button>
          </div>
        </div>
      </section>
    </section>
  </div>
</template>
