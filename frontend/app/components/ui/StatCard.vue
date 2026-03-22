<script setup lang="ts">
const props = defineProps<{
  label: string
  value: string
  detail: string
  tone?: 'primary' | 'secondary' | 'accent' | 'neutral'
}>()

const toneClassMap = {
  primary: 'text-primary',
  secondary: 'text-primary',
  accent: 'text-error',
  neutral: 'text-neutral',
} as const
</script>

<template>
  <article class="card border border-base-200 bg-base-100 shadow-sm">
    <div class="card-body gap-2">
      <p class="section-kicker">{{ label }}</p>
      <p class="text-number text-4xl font-extrabold tracking-tight" :class="props.tone ? toneClassMap[props.tone] : ''">{{ value }}</p>
      <p class="text-sm leading-6 text-base-content/72">{{ detail }}</p>
    </div>
  </article>
</template>
