<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [id: number] }>()

const { students } = useMockData()
const { show } = useToast()

const form = reactive({
  name: '',
  duration: 60,
  selectedStudents: [] as number[],
})

const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const activeStudents = students.filter(s => s.status === 'active')
const loading = ref(false)

function toggleStudent(id: number) {
  const idx = form.selectedStudents.indexOf(id)
  if (idx === -1) form.selectedStudents.push(id)
  else form.selectedStudents.splice(idx, 1)
}

async function handleSubmit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
  show(`Группа «${form.name}» создана`)
  emit('created', 4)
  emit('close')
  Object.assign(form, { name: '', duration: 60, selectedStudents: [] })
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-lg">
      <h3 class="font-semibold text-lg mb-4">Новая группа</h3>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Название группы *</legend>
          <input v-model="form.name" type="text" class="input input-bordered w-full" placeholder="Например: Advanced C1" required />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Длительность занятия</legend>
          <select v-model.number="form.duration" class="select select-bordered w-full">
            <option v-for="d in durationOptions" :key="d" :value="d">{{ d }} мин</option>
          </select>
        </fieldset>

        <div>
          <p class="text-sm font-medium mb-2">Участники</p>
          <div class="border border-base-300 rounded-lg max-h-48 overflow-y-auto">
            <label
              v-for="student in activeStudents"
              :key="student.id"
              class="flex items-center gap-3 px-3 py-2 hover:bg-base-200 cursor-pointer"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                :checked="form.selectedStudents.includes(student.id)"
                @change="toggleStudent(student.id)"
              />
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content w-7 rounded-full">
                  <span class="text-[10px]">{{ student.firstName[0] }}{{ student.lastName[0] }}</span>
                </div>
              </div>
              <span class="text-sm">{{ student.firstName }} {{ student.lastName }}</span>
            </label>
          </div>
          <p class="text-xs text-base-content/50 mt-1">Выбрано: {{ form.selectedStudents.length }}</p>
        </div>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !form.name">
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
