<script setup lang="ts">
const { user } = useAuth()

const today = new Date().toLocaleDateString('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
</script>

<template>
  <header class="h-16 bg-base-100 border-b border-base-300 flex items-center px-4 lg:px-6 gap-4 shrink-0">
    <div class="hidden lg:block">
      <p class="text-sm font-medium capitalize">{{ today }}</p>
    </div>
    <div class="lg:hidden">
      <span class="text-lg font-bold text-primary tracking-tight">Teachly</span>
    </div>

    <div class="flex-1" />

    <label class="input input-bordered input-sm flex items-center gap-2 w-48 lg:w-64">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 opacity-50">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input type="text" class="grow" placeholder="Поиск..." />
    </label>

    <div class="hidden lg:flex">
      <UiUserAvatar
        :avatar-data="user?.avatarData"
        :first-name="user?.firstName"
        :last-name="user?.lastName"
        :email="user?.email"
        size="sm"
      />
    </div>
  </header>
</template>
