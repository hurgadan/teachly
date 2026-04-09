<script setup lang="ts">
import type { Student } from '~/types/students'

const props = defineProps<{ open: boolean; studentId?: string }>()
const emit = defineEmits<{ close: []; added: [] }>()

const { listStudents } = useStudentsApi()
const { createPayment } = usePaymentsApi()
const { show } = useToast()

const students = ref<Student[]>([])

onMounted(async () => {
  students.value = await listStudents()
})

const activeStudents = computed(() => students.value.filter(s => s.status !== 'archived'))

const form = reactive({
  studentId: props.studentId || '',
  amount: 0,
  comment: '',
})

watch(() => props.studentId, (val) => {
  if (val) form.studentId = val
})

const loading = ref(false)

async function handleSubmit() {
  if (!form.studentId || !form.amount) return

  try {
    loading.value = true
    await createPayment({
      studentId: form.studentId,
      amount: form.amount,
      comment: form.comment || null,
    })
    const student = students.value.find(s => s.id === form.studentId)
    show(`Оплата ${form.amount.toLocaleString('ru-RU')} ₽ от ${student?.firstName || 'ученика'} добавлена`)
    emit('added')
    emit('close')
    form.amount = 0
    form.comment = ''
  } catch {
    show('Ошибка при добавлении оплаты')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-sm">
      <h3 class="font-semibold text-lg mb-4">Добавить оплату</h3>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <fieldset v-if="!studentId" class="fieldset">
          <legend class="fieldset-legend">Ученик *</legend>
          <select v-model="form.studentId" class="select select-bordered w-full" required>
            <option value="" disabled>Выберите ученика</option>
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
          <legend class="fieldset-legend">Комментарий</legend>
          <input v-model="form.comment" type="text" class="input input-bordered w-full" placeholder="Необязательно" />
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
