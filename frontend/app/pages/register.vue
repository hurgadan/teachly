<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
})
const loading = ref(false)

async function handleRegister() {
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  navigateTo('/')
}
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-6">
      <h2 class="text-lg font-semibold text-center mb-4">Регистрация</h2>
      <form @submit.prevent="handleRegister" class="grid gap-4">
        <div class="grid grid-cols-2 gap-3">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Имя</legend>
            <input
              v-model="form.firstName"
              type="text"
              class="input input-bordered w-full"
              placeholder="Анна"
              required
            />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Фамилия</legend>
            <input
              v-model="form.lastName"
              type="text"
              class="input input-bordered w-full"
              placeholder="Иванова"
              required
            />
          </fieldset>
        </div>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Email</legend>
          <input
            v-model="form.email"
            type="email"
            class="input input-bordered w-full"
            placeholder="you@example.com"
            required
          />
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Пароль</legend>
          <input
            v-model="form.password"
            type="password"
            class="input input-bordered w-full"
            placeholder="Минимум 8 символов"
            required
          />
        </fieldset>
        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          <span v-if="loading" class="loading loading-spinner loading-sm" />
          {{ loading ? 'Регистрация...' : 'Создать аккаунт' }}
        </button>
      </form>
      <div class="divider text-xs">или</div>
      <NuxtLink to="/login" class="btn btn-ghost btn-sm w-full">
        Уже есть аккаунт? Войти
      </NuxtLink>
    </div>
  </div>
</template>
