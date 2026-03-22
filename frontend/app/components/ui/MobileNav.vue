<script setup lang="ts">
const items = [
  {
    to: '/',
    label: 'Обзор',
    icon: 'M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5',
  },
  {
    to: '/students',
    label: 'Ученики',
    icon: 'M7 19v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1M12 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z',
  },
  {
    to: '/groups',
    label: 'Группы',
    icon: 'M4 7h16M4 12h16M4 17h16',
  },
  {
    to: '/calendar',
    label: 'Календарь',
    icon: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  },
  {
    to: '/payments',
    label: 'Оплаты',
    icon: 'M5 8h14M7 12h10M9 16h6M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  },
  {
    to: '/settings',
    label: 'Профиль',
    icon: 'M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
  },
]
</script>

<template>
  <nav
    aria-label="Мобильная навигация"
    class="mobile-dock fixed inset-x-0 bottom-0 z-40 border-t border-base-content/8 bg-base-100/96 shadow-[0_-10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden"
  >
    <div class="dock dock-sm mx-auto w-full max-w-[1500px] border-0 bg-transparent">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex flex-col gap-0.5 pt-0 text-base-content/65 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        active-class="dock-active !text-primary"
        exact-active-class="dock-active !text-primary"
      >
        <svg aria-hidden="true" class="size-[1rem]" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
          <path :d="item.icon" />
        </svg>
        <span class="dock-label text-[0.62rem]">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
