<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [] }>()

const { students, groups } = useMockData()
const { show } = useToast()

const form = reactive({
  type: 'student' as 'student' | 'group',
  studentId: 0,
  groupId: 0,
  date: '2026-04-06',
  time: '10:00',
  duration: 60,
})

const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const activeStudents = students.filter(s => s.status === 'active')
const loading = ref(false)

function timeOptions() {
  const opts: string[] = []
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return opts
}
const times = timeOptions()

async function handleSubmit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
  show('Разовое занятие создано')
  emit('created')
  emit('close')
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-sm">
      <h3 class="font-semibold text-lg mb-4">Разовое занятие</h3>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
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
          <select v-model.number="form.studentId" class="select select-bordered w-full" required>
            <option :value="0" disabled>Выберите</option>
            <option v-for="s in activeStudents" :key="s.id" :value="s.id">
              {{ s.firstName }} {{ s.lastName }}
            </option>
          </select>
        </fieldset>

        <fieldset v-if="form.type === 'group'" class="fieldset">
          <legend class="fieldset-legend">Группа *</legend>
          <select v-model.number="form.groupId" class="select select-bordered w-full" required>
            <option :value="0" disabled>Выберите</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Дата</legend>
          <input v-model="form.date" type="date" class="input input-bordered w-full" />
        </fieldset>

        <div class="grid grid-cols-2 gap-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Время</legend>
            <select v-model="form.time" class="select select-bordered w-full">
              <option v-for="t in times" :key="t" :value="t">{{ t }}</option>
            </select>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Длительность</legend>
            <select v-model.number="form.duration" class="select select-bordered w-full">
              <option v-for="d in durationOptions" :key="d" :value="d">{{ d }} мин</option>
            </select>
          </fieldset>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            Создать
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
