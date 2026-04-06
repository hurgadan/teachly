<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [id: number] }>()

const { show } = useToast()

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  telegram: '',
  price: 2000,
  duration: 60,
  comment: '',
})

// 30–90 мин, шаг 15
const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 600))
  loading.value = false
  show(`Ученик ${form.firstName} ${form.lastName} создан`)
  emit('created', 9)
  emit('close')
  Object.assign(form, { firstName: '', lastName: '', phone: '', email: '', telegram: '', price: 2000, duration: 60, comment: '' })
}
</script>

<template>
  <dialog :class="['modal', { 'modal-open': open }]">
    <div class="modal-box max-w-lg">
      <h3 class="font-semibold text-lg mb-4">Новый ученик</h3>
      <form @submit.prevent="handleSubmit" class="grid gap-4">
        <div class="grid grid-cols-2 gap-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Имя *</legend>
            <input v-model="form.firstName" type="text" class="input input-bordered w-full" required />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Фамилия</legend>
            <input v-model="form.lastName" type="text" class="input input-bordered w-full" />
          </fieldset>
        </div>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Телефон</legend>
          <input v-model="form.phone" type="tel" class="input input-bordered w-full" placeholder="+7 ..." />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <input v-model="form.email" type="email" class="input input-bordered w-full" />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Telegram</legend>
          <input v-model="form.telegram" type="text" class="input input-bordered w-full" placeholder="@username" />
        </fieldset>
        <div class="grid grid-cols-2 gap-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Цена за занятие, ₽</legend>
            <input v-model.number="form.price" type="number" class="input input-bordered w-full" min="0" step="100" />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Длительность</legend>
            <select v-model.number="form.duration" class="select select-bordered w-full">
              <option v-for="d in durationOptions" :key="d" :value="d">{{ d }} мин</option>
            </select>
          </fieldset>
        </div>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Комментарий</legend>
          <textarea v-model="form.comment" class="textarea textarea-bordered w-full" rows="2" />
        </fieldset>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Отмена</button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !form.firstName">
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
