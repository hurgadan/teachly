<script setup lang="ts">
import type { CreateGroupPayload } from '~/types/groups'
import type { Student } from '~/types/students'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; created: [id: string] }>()

const { createGroup } = useGroupsApi()
const { listStudents } = useStudentsApi()
const { show } = useToast()

const students = ref<Student[]>([])
const form = reactive<CreateGroupPayload>({
  name: '',
  duration: 60,
  studentIds: [],
})

const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const loading = ref(false)
const loadingStudents = ref(false)

const activeStudents = computed(() => students.value.filter(s => s.status === 'active'))

watch(() => props.open, async (isOpen) => {
  if (!isOpen) return

  loadingStudents.value = true
  try {
    students.value = await listStudents()
  } finally {
    loadingStudents.value = false
  }
})

function toggleStudent(id: string) {
  const idx = form.studentIds.indexOf(id)
  if (idx === -1) form.studentIds.push(id)
  else form.studentIds.splice(idx, 1)
}

function getStudentInitials(firstName: string, lastName: string | null) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}` || '—'
}

async function handleSubmit() {
  try {
    loading.value = true
    const group = await createGroup(form)
    show(`Группа «${group.name}» создана`)
    emit('created', group.id)
    emit('close')
    Object.assign(form, { name: '', duration: 60, studentIds: [] })
  } catch {
    show('Ошибка при создании группы')
  } finally {
    loading.value = false
  }
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
          <div v-if="loadingStudents" class="flex justify-center py-6">
            <span class="loading loading-spinner loading-md" />
          </div>
          <div v-else class="border border-base-300 rounded-lg max-h-48 overflow-y-auto">
            <label
              v-for="student in activeStudents"
              :key="student.id"
              class="flex items-center gap-3 px-3 py-2 hover:bg-base-200 cursor-pointer"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                :checked="form.studentIds.includes(student.id)"
                @change="toggleStudent(student.id)"
              />
              <div class="avatar placeholder">
                <div class="bg-neutral text-neutral-content w-7 rounded-full">
                  <span class="text-[10px]">{{ getStudentInitials(student.firstName, student.lastName) }}</span>
                </div>
              </div>
              <span class="text-sm">{{ student.firstName }} {{ student.lastName || '' }}</span>
            </label>
          </div>
          <p class="text-xs text-base-content/50 mt-1">Выбрано: {{ form.studentIds.length }}</p>
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
