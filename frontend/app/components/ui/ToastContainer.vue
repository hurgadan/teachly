<script setup lang="ts">
const { toasts } = useToast()

const alertClass: Record<string, string> = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
}
</script>

<template>
  <div class="toast toast-end toast-bottom z-50">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['alert shadow-lg', alertClass[toast.type]]"
      >
        <span class="text-sm">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
