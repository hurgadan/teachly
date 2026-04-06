<script setup lang="ts">
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

    <button class="btn btn-ghost btn-sm btn-square relative">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
      <span class="badge badge-xs badge-primary absolute -top-0.5 -right-0.5">3</span>
    </button>

    <div class="hidden lg:flex avatar placeholder">
      <div class="bg-primary text-primary-content w-8 rounded-full">
        <span class="text-xs font-medium">АИ</span>
      </div>
    </div>
  </header>
</template>
