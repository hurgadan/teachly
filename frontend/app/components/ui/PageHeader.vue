<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <header class="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div class="min-w-0">
      <p v-if="eyebrow" class="section-kicker">{{ eyebrow }}</p>
      <h1 class="mt-1 text-4xl font-bold leading-none tracking-tight text-balance md:text-5xl">{{ title }}</h1>
      <p v-if="description" class="app-muted mt-2 max-w-2xl text-sm leading-6">{{ description }}</p>
    </div>

    <slot />
  </header>
</template>
