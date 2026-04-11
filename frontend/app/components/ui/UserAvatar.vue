<script setup lang="ts">
const props = defineProps<{
  avatarData?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string
  size?: 'sm' | 'md'
}>()

const initials = computed(() => {
  if (props.firstName) {
    const last = props.lastName ? props.lastName[0].toUpperCase() : ''
    return props.firstName[0].toUpperCase() + last
  }
  if (props.email) return props.email[0].toUpperCase()
  return '?'
})

const sizeClass = computed(() => props.size === 'sm' ? 'w-8 text-xs' : 'w-9 text-sm')
</script>

<template>
  <div class="avatar" :class="avatarData ? '' : 'placeholder'">
    <div
      class="rounded-full overflow-hidden"
      :class="[sizeClass, avatarData ? '' : 'bg-primary text-primary-content flex items-center justify-center']"
    >
      <img v-if="avatarData" :src="avatarData" class="w-full h-full object-cover" alt="avatar" />
      <span v-else class="font-medium leading-none">{{ initials }}</span>
    </div>
  </div>
</template>
