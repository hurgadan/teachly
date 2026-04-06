<script setup lang="ts">
const { workSchedule } = useMockData()

const schedule = ref(workSchedule.map(day => ({
  ...day,
  intervals: day.intervals.map(i => ({ ...i })),
})))

const bufferMinutes = ref(15)
const bufferOptions = [0, 15, 30, 45, 60]

const { show: showToast } = useToast()

function handleSaveProfile() {
  showToast('Профиль сохранён')
}

function handleSaveSchedule() {
  showToast('Рабочий график сохранён')
}

function timeOptions() {
  const opts: string[] = []
  for (let h = 7; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
}

const times = timeOptions()

function addInterval(dayIndex: number) {
  schedule.value[dayIndex].intervals.push({ from: '09:00', to: '13:00' })
}

function removeInterval(dayIndex: number, intervalIndex: number) {
  schedule.value[dayIndex].intervals.splice(intervalIndex, 1)
}
</script>

<template>
  <div>
    <UiPageHeader title="Настройки" subtitle="Профиль и рабочий график" />

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Profile -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <h3 class="font-semibold mb-4">Профиль преподавателя</h3>
          <div class="grid gap-4">
            <div class="flex items-center gap-4 mb-2">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content w-16 rounded-full">
                  <span class="text-xl font-medium">АИ</span>
                </div>
              </div>
              <div>
                <p class="font-medium">Анна Иванова</p>
                <button class="btn btn-ghost btn-xs mt-1">Изменить фото</button>
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Имя</legend>
                <input type="text" value="Анна" class="input input-bordered w-full" />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Фамилия</legend>
                <input type="text" value="Иванова" class="input input-bordered w-full" />
              </fieldset>
            </div>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Email</legend>
              <input type="email" value="anna.ivanova@mail.ru" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Телефон</legend>
              <input type="tel" value="+7 916 555-12-34" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Язык интерфейса</legend>
              <select class="select select-bordered w-full">
                <option selected>Русский</option>
                <option>English</option>
              </select>
            </fieldset>
            <div class="flex justify-end gap-2 mt-2">
              <button class="btn btn-ghost btn-sm">Отмена</button>
              <button class="btn btn-primary btn-sm" @click="handleSaveProfile()">Сохранить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Work Schedule -->
      <div class="space-y-6">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h3 class="font-semibold mb-4">Рабочий график</h3>
            <div class="space-y-4">
              <div
                v-for="(day, dayIndex) in schedule"
                :key="day.day"
                class="border border-base-300 rounded-lg p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="day.enabled"
                      type="checkbox"
                      class="toggle toggle-sm toggle-primary"
                    />
                    <span class="font-medium text-sm">{{ day.day }}</span>
                  </label>
                  <button
                    v-if="day.enabled"
                    class="btn btn-ghost btn-xs"
                    @click="addInterval(dayIndex)"
                  >
                    + интервал
                  </button>
                </div>

                <div v-if="day.enabled && day.intervals.length > 0" class="space-y-2 mt-2">
                  <div
                    v-for="(interval, intervalIndex) in day.intervals"
                    :key="intervalIndex"
                    class="flex items-center gap-2"
                  >
                    <select v-model="interval.from" class="select select-bordered select-sm flex-1">
                      <option v-for="t in times" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <span class="text-base-content/40 text-sm">—</span>
                    <select v-model="interval.to" class="select select-bordered select-sm flex-1">
                      <option v-for="t in times" :key="t" :value="t">{{ t }}</option>
                    </select>
                    <button
                      v-if="day.intervals.length > 1"
                      class="btn btn-ghost btn-xs btn-square text-error"
                      @click="removeInterval(dayIndex, intervalIndex)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p v-if="day.enabled && day.intervals.length === 0" class="text-xs text-base-content/40 mt-2">
                  Добавьте рабочие интервалы
                </p>
                <p v-if="!day.enabled" class="text-xs text-base-content/40 mt-1">
                  Выходной
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Buffer -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <h3 class="font-semibold mb-2">Буфер после занятия</h3>
            <p class="text-xs text-base-content/50 mb-3">
              Минимальный перерыв между занятиями. Влияет на доступные слоты в календаре.
            </p>
            <select v-model="bufferMinutes" class="select select-bordered w-full sm:w-48">
              <option v-for="opt in bufferOptions" :key="opt" :value="opt">
                {{ opt === 0 ? 'Без буфера' : `${opt} мин` }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button class="btn btn-ghost btn-sm">Отмена</button>
          <button class="btn btn-primary btn-sm" @click="handleSaveSchedule()">Сохранить график</button>
        </div>
      </div>
    </div>
  </div>
</template>
