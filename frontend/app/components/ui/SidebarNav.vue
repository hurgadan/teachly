<script setup lang="ts">
const items = [
  {
    to: '/',
    label: 'Обзор',
    hint: 'Сегодня',
    icon: 'M4 12h16M4 6h16M4 18h10',
  },
  {
    to: '/students',
    label: 'Ученики',
    hint: '24 карточки',
    icon: 'M7 19v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1M12 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z',
  },
  {
    to: '/groups',
    label: 'Группы',
    hint: '4 группы',
    icon: 'M4 7h16M4 12h16M4 17h16',
  },
  {
    to: '/calendar',
    label: 'Календарь',
    hint: 'Неделя',
    icon: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  },
  {
    to: '/payments',
    label: 'Оплаты',
    hint: 'Баланс',
    icon: 'M5 8h14M7 12h10M9 16h6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  },
  {
    to: '/settings',
    label: 'Профиль',
    hint: 'Настройки',
    icon: 'M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
  },
]
</script>

<template>
  <aside class="sticky top-0 hidden h-screen min-h-screen flex-col border-r border-base-200/70 bg-base-100/80 backdrop-blur lg:flex">
    <div class="flex min-h-0 flex-1 flex-col px-4 py-5">
      <div class="flex items-center gap-3 px-2">
        <div class="flex size-9 items-center justify-center rounded-box bg-primary/10 text-primary">
          <svg aria-hidden="true" class="size-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" viewBox="0 0 24 24">
            <path d="M6 17 17 6M7 7h.01M17 17h.01M7 17a1 1 0 1 0 0 .01V17ZM17 7a1 1 0 1 0 0 .01V7Z" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="truncate text-lg font-bold tracking-tight text-primary">Teachly</p>
          <p class="text-xs text-base-content/45">CRM преподавателя</p>
        </div>
      </div>

      <div class="mt-8 px-2">
        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-base-content/40">Основное</p>

        <nav aria-label="Основная навигация" class="menu menu-sm gap-1 p-0">
          <NuxtLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-3 text-sm font-medium text-base-content/72"
            active-class="active font-semibold"
            exact-active-class="active font-semibold"
          >
            <svg aria-hidden="true" class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
              <path :d="item.icon" />
            </svg>
            <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
            <span class="text-[0.7rem] font-medium text-current/45">{{ item.hint }}</span>
          </NuxtLink>
        </nav>
      </div>

      <div class="mt-auto px-2 pt-6">
        <div class="app-surface rounded-box p-3">
          <div class="flex items-center gap-3">
            <div class="avatar avatar-placeholder">
              <div class="size-10 rounded-box bg-primary text-primary-content">
                <span class="text-sm font-semibold">ЕИ</span>
              </div>
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold">Елена Иванова</p>
              <p class="truncate text-xs text-base-content/50">Преподаватель английского</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
