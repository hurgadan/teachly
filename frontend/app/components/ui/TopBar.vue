<script setup lang="ts">
const today = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date('2026-03-22T09:00:00'))
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-base-200/70 bg-base-100/88 backdrop-blur-xl">
    <div class="navbar mx-auto min-h-18 w-full max-w-[1500px] gap-3 px-4 py-2.5 md:px-6 lg:px-8">
      <div class="min-w-0">
        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-base-content/38">Сегодня</p>
        <p class="truncate text-sm font-semibold text-base-content md:text-base">{{ today }}</p>
      </div>

      <div class="navbar-end flex items-center gap-3">
        <label class="input input-sm input-bordered hidden border-base-300 bg-base-100 md:flex md:w-72 md:items-center">
          <svg aria-hidden="true" class="size-4 opacity-45" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
          </svg>
          <input
            aria-label="Поиск по ученикам и группам"
            autocomplete="off"
            name="search"
            placeholder="Найти ученика, группу, слот…"
            type="search"
          >
        </label>

        <button
          aria-label="Открыть уведомления"
          class="btn btn-ghost btn-circle btn-sm"
          type="button"
        >
          <svg aria-hidden="true" class="size-4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
