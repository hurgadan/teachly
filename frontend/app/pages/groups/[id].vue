<script setup lang="ts">
const route = useRoute()
const { getGroup, getStudent, formatPrice } = useMockData()

const groupId = Number(route.params.id)
const group = getGroup(groupId)

const durationOptions = Array.from({ length: 5 }, (_, i) => 30 + i * 15)

const showScheduleModal = ref(false)
const { show: showToast } = useToast()

function handleSave() {
  showToast('Группа сохранена')
}
</script>

<template>
  <div v-if="group">
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
              <input type="text" :value="group.name" class="input input-bordered w-full" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Длительность занятия</legend>
              <select class="select select-bordered w-full">
                <option
                  v-for="d in durationOptions"
                  :key="d"
                  :value="d"
                  :selected="d === group.duration"
                >
                  {{ d }} мин
                </option>
              </select>
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Расписание</legend>
              <input type="text" :value="group.schedule" class="input input-bordered w-full" readonly />
            </fieldset>
            <div class="flex justify-end gap-2 mt-2">
              <button class="btn btn-ghost btn-sm">Отмена</button>
              <button class="btn btn-primary btn-sm" @click="handleSave()">Сохранить</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Members -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4 lg:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold">Участники ({{ group.members.length }})</h3>
            <button class="btn btn-ghost btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Добавить
            </button>
          </div>
          <div class="divide-y divide-base-200">
            <div
              v-for="member in group.members"
              :key="member.studentId"
              class="flex items-center justify-between py-3"
            >
              <div class="flex items-center gap-3">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content w-9 rounded-full">
                    <span class="text-xs">{{ member.name.split(' ').map(n => n[0]).join('') }}</span>
                  </div>
                </div>
                <div>
                  <NuxtLink :to="`/students/${member.studentId}`" class="text-sm font-medium hover:text-primary transition-colors">
                    {{ member.name }}
                  </NuxtLink>
                  <p v-if="getStudent(member.studentId)" class="text-xs text-base-content/50">
                    {{ formatPrice(getStudent(member.studentId)!.price) }} · {{ getStudent(member.studentId)!.duration }} мин
                  </p>
                </div>
              </div>
              <button class="btn btn-ghost btn-xs text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalsScheduleModal
      v-if="group"
      :open="showScheduleModal"
      :entity-name="group.name"
      :default-duration="group.duration"
      @close="showScheduleModal = false"
      @saved="showScheduleModal = false"
    />
  </div>

  <div v-else class="text-center py-12">
    <p class="text-base-content/50">Группа не найдена</p>
    <NuxtLink to="/groups" class="btn btn-ghost btn-sm mt-4">← К списку групп</NuxtLink>
  </div>
</template>
