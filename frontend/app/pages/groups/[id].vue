<script setup lang="ts">
import type { Group } from '~/types/groups'
import type { Student } from '~/types/students'

const route = useRoute()
const { getGroup, updateGroup } = useGroupsApi()
const { listStudents } = useStudentsApi()
const { show: showToast } = useToast()

const groupId = computed(() => String(route.params.id))
const group = ref<Group | null>(null)
const students = ref<Student[]>([])
const loading = ref(true)
const saving = ref(false)
const showStudentsPicker = ref(false)

const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)
const form = reactive({
  name: '',
  duration: 60,
  studentIds: [] as string[],
})

const showScheduleModal = ref(false)

function formatPrice(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

const selectedStudents = computed(() =>
  students.value.filter((student) => form.studentIds.includes(student.id)),
)

const availableStudents = computed(() =>
  students.value.filter((student) => !form.studentIds.includes(student.id)),
)

async function loadData() {
  try {
    loading.value = true
    const [loadedGroup, loadedStudents] = await Promise.all([
      getGroup(groupId.value),
      listStudents(),
    ])

    group.value = loadedGroup
    students.value = loadedStudents
    form.name = loadedGroup.name
    form.duration = loadedGroup.duration
    form.studentIds = loadedGroup.members.map((member) => member.studentId)
  } catch {
    group.value = null
  } finally {
    loading.value = false
  }
}

function addStudent(studentId: string) {
  if (!form.studentIds.includes(studentId)) {
    form.studentIds.push(studentId)
  }
}

function removeStudent(studentId: string) {
  form.studentIds = form.studentIds.filter((id) => id !== studentId)
}

async function handleSave() {
  try {
    saving.value = true
    group.value = await updateGroup(groupId.value, {
      name: form.name,
      duration: form.duration,
      studentIds: form.studentIds,
    })
    showToast('Группа сохранена')
  } catch {
    showToast('Ошибка при сохранении группы')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div v-if="loading" class="flex justify-center py-12">
    <span class="loading loading-spinner loading-lg" />
  </div>

  <div v-else-if="group">
    <NuxtLink to="/groups" class="btn btn-ghost btn-sm gap-1 mb-4 -ml-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      </svg>
      Группы
    </NuxtLink>

    <UiPageHeader :title="group.name">
      <template #actions>
        <button class="btn btn-primary btn-sm" @click="showScheduleModal = true">Сформировать расписание</button>
      </template>
    </UiPageHeader>

    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Group info -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <h3 class="font-semibold mb-4">Параметры группы</h3>
          <div class="grid gap-4">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Название группы</legend>
              <input v-model="form.name" type="text" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Длительность занятия</legend>
              <select v-model.number="form.duration" class="select select-bordered w-full">
                <option
                  v-for="d in durationOptions"
                  :key="d"
                  :value="d"
                >
                  {{ d }} мин
                </option>
              </select>
            </fieldset>
            <div class="flex justify-end gap-2 mt-2">
              <button class="btn btn-ghost btn-sm">Отмена</button>
              <button class="btn btn-primary btn-sm" :disabled="saving" @click="handleSave()">
                <span v-if="saving" class="loading loading-spinner loading-sm" />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Members -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Участники ({{ selectedStudents.length }})</h3>
            <button class="btn btn-ghost btn-sm" @click="showStudentsPicker = !showStudentsPicker">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Добавить
            </button>
          </div>
          <div v-if="showStudentsPicker" class="border border-base-300 rounded-lg p-3 mb-4">
            <p class="text-sm font-medium mb-3">Доступные ученики</p>
            <div v-if="availableStudents.length === 0" class="text-sm text-base-content/50">
              Все ученики уже добавлены
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="student in availableStudents"
                :key="student.id"
                class="btn btn-outline btn-sm"
                @click="addStudent(student.id)"
              >
                {{ student.firstName }} {{ student.lastName || '' }}
              </button>
            </div>
          </div>
          <div class="divide-y divide-base-200">
            <div
              v-for="member in selectedStudents"
              :key="member.id"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content w-9 rounded-full">
                    <span class="text-xs">{{ `${member.firstName}${member.lastName || ''}`.trim().split(' ').map(n => n[0]).join('') }}</span>
                  </div>
                </div>
                <div>
                  <NuxtLink :to="`/students/${member.id}`" class="text-sm font-medium hover:text-primary transition-colors">
                    {{ member.firstName }} {{ member.lastName || '' }}
                  </NuxtLink>
                  <p class="text-xs text-base-content/50">
                    {{ formatPrice(member.price) }} · {{ member.duration }} мин
                  </p>
                </div>
              </div>
              <button class="btn btn-ghost btn-xs text-error" @click="removeStudent(member.id)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalsCreateLessonModal
      v-if="group"
      :open="showScheduleModal"
      :group-id="group.id"
      :default-duration="form.duration"
      @close="showScheduleModal = false"
      @created="showScheduleModal = false"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-base-content/50">Группа не найдена</p>
    <NuxtLink to="/groups" class="btn btn-ghost btn-sm mt-4">← К списку групп</NuxtLink>
  </div>
</template>
