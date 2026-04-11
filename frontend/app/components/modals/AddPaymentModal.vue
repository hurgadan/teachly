<script setup lang="ts">
import type { Student } from '~/types/students'
import type { PaymentType } from '~/types/payments'

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
  lessonsCount: 1,
  type: 'prepaid' as PaymentType,
  comment: '',
})

watch(() => props.studentId, (val) => {
  if (val) form.studentId = val
})

const selectedStudent = computed(() => students.value.find(s => s.id === form.studentId))
const calculatedAmount = computed(() => form.lessonsCount * (selectedStudent.value?.price ?? 0))

watch(selectedStudent, (student) => {
  if (student) form.type = student.paymentType as PaymentType
})

const loading = ref(false)

async function handleSubmit() {
  if (!form.studentId || !form.lessonsCount) return

  try {
    loading.value = true
    await createPayment({
      studentId: form.studentId,
      lessonsCount: form.lessonsCount,
      type: form.type,
      comment: form.comment || null,
    })
    const student = selectedStudent.value
    show(`Оплата за ${form.lessonsCount} занятий (${calculatedAmount.value.toLocaleString('ru-RU')} ₽) от ${student?.firstName || 'ученика'} добавлена`)
    emit('added')
    emit('close')
    form.lessonsCount = 1
    form.type = 'prepaid'
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
          <legend class="fieldset-legend">Тип оплаты *</legend>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.type" value="prepaid" class="radio radio-sm radio-primary" />
              <span class="text-sm">Предоплата</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.type" value="postpaid" class="radio radio-sm radio-primary" />
              <span class="text-sm">Постфактум</span>
            </label>
          </div>
        </fieldset>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Количество занятий *</legend>
          <input
            v-model.number="form.lessonsCount"
            type="number"
            class="input input-bordered w-full"
            min="1"
            max="100"
            step="1"
            required
          />
        </fieldset>

        <div v-if="form.lessonsCount && selectedStudent" class="text-sm text-base-content/70 bg-base-200 rounded-lg px-3 py-2">
          {{ form.lessonsCount }} × {{ selectedStudent.price.toLocaleString('ru-RU') }} ₽ =
          <span class="font-semibold text-base-content">{{ calculatedAmount.toLocaleString('ru-RU') }} ₽</span>
        </div>

        <fieldset class="fieldset">
          <legend class="fieldset-legend">Комментарий</legend>
          <input v-model="form.comment" type="text" class="input input-bordered w-full" placeholder="Необязательно" />
        </fieldset>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !form.studentId || !form.lessonsCount">
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
