<script setup lang="ts">
const props = defineProps<{ open: boolean; studentId?: number }>()
const emit = defineEmits<{ close: []; added: [] }>()

const { students } = useMockData()
const { show } = useToast()

const activeStudents = students.filter(s => s.status !== 'archived')

const form = reactive({
  studentId: props.studentId || 0,
  amount: 0,
  method: 'Перевод',
  date: new Date().toISOString().split('T')[0],
})

watch(() => props.studentId, (val) => {
  if (val) form.studentId = val
})

const methods = ['Перевод', 'Наличные', 'Карта']
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
  const student = students.find(s => s.id === form.studentId)
  show(`Оплата ${form.amount.toLocaleString('ru-RU')} ₽ от ${student?.firstName || 'ученика'} добавлена`)
  emit('added')
  emit('close')
  form.amount = 0
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-sm">
      <h3 class="font-semibold text-lg mb-4">Добавить оплату</h3>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <fieldset v-if="!studentId" class="fieldset">
          <legend class="fieldset-legend">Ученик *</legend>
          <select v-model.number="form.studentId" class="select select-bordered w-full" required>
            <option :value="0" disabled>Выберите ученика</option>
            <option v-for="s in activeStudents" :key="s.id" :value="s.id">
              {{ s.firstName }} {{ s.lastName }}
            </option>
          </select>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Сумма, ₽ *</legend>
          <input v-model.number="form.amount" type="number" class="input input-bordered w-full" min="1" step="100" required />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Способ оплаты</legend>
          <select v-model="form.method" class="select select-bordered w-full">
            <option v-for="m in methods" :key="m">{{ m }}</option>
          </select>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Дата</legend>
          <input v-model="form.date" type="date" class="input input-bordered w-full" />
        </fieldset>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !form.studentId || !form.amount">
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            Добавить
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="emit('close')">close</button>
    </form>
  </dialog>
</template>
