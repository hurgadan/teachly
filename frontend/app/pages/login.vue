<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const email = ref('anna.ivanova@mail.ru')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  navigateTo('/')
}
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-6">
      <h2 class="text-lg font-semibold text-center mb-4">Вход в систему</h2>
      <form @submit.prevent="handleLogin" class="grid gap-4">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <input
            v-model="email"
            type="email"
            class="input input-bordered w-full"
            placeholder="you@example.com"
            required
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Пароль</legend>
          <input
            v-model="password"
            type="password"
            class="input input-bordered w-full"
            placeholder="Введите пароль"
            required
          />
        </fieldset>
        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
            <span class="text-sm">Запомнить</span>
          </label>
          <a href="#" class="text-sm text-primary hover:underline">Забыли пароль?</a>
        </div>
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      <div class="divider text-xs">или</div>
      <NuxtLink to="/register" class="btn btn-ghost btn-sm w-full">
        Создать аккаунт
      </NuxtLink>
    </div>
  </div>
</template>
