<script setup lang="ts">
const groups = [
  { id: 'evening-a2', name: 'Evening A2', students: 4, schedule: 'Пн · Ср · 18:30', duration: '90 мин', note: 'Английский для взрослых' },
  { id: 'teens-b1', name: 'Teens B1', students: 5, schedule: 'Ср · 11:30', duration: '80 мин', note: 'Подготовка к экзаменам' },
]
</script>

<template>
  <div class="w-full min-w-0">
    <UiPageHeader
      title="Группы"
    />

    <section class="grid gap-4 lg:grid-cols-2">
      <article v-for="group in groups" :key="group.name" class="card border border-base-200 bg-base-100 shadow-sm">
        <div class="card-body">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="section-kicker">Группа</p>
            <h2 class="mt-2 text-3xl font-bold">{{ group.name }}</h2>
          </div>
          <span class="badge badge-primary badge-soft">{{ group.students }} учеников</span>
        </div>

        <p class="text-sm leading-6 text-base-content/72">{{ group.note }}</p>

        <dl class="mt-6 grid gap-3 md:grid-cols-2">
          <div class="stat border border-base-200 bg-base-100">
            <dt class="text-xs uppercase tracking-[0.2em] text-base-content/50">Расписание</dt>
            <dd class="text-number mt-2 text-lg font-bold whitespace-nowrap">{{ group.schedule }}</dd>
          </div>
          <div class="stat border border-base-200 bg-base-100">
            <dt class="text-xs uppercase tracking-[0.2em] text-base-content/50">Длительность</dt>
            <dd class="text-number mt-2 text-lg font-bold">{{ group.duration }}</dd>
          </div>
        </dl>

        <div class="card-actions mt-4 justify-start">
          <NuxtLink :to="`/groups/${group.id}`" class="btn btn-outline">Состав группы</NuxtLink>
          <NuxtLink class="btn btn-ghost" to="/calendar">Открыть в календаре</NuxtLink>
        </div>
        </div>
      </article>
    </section>
  </div>
</template>
