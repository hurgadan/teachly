<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const { register } = useAuth()

const form = reactive({
  email: '',
  password: '',
})
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    await register(form.email, form.password)
    navigateTo('/')
  } catch (e: any) {
    if (e?.statusCode === 409) {
      error.value = 'Пользователь с таким email уже существует'
    } else if (e?.statusCode === 400) {
      error.value = 'Проверьте правильность заполнения полей'
    } else {
      error.value = 'Ошибка при регистрации. Попробуйте позже.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-6">
      <h2 class="text-lg font-semibold text-center mb-4">Регистрация</h2>
      <div v-if="error" class="alert alert-error text-sm mb-2">
        {{ error }}
      </div>
      <form @submit.prevent="handleRegister" class="grid gap-4">
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
            placeholder="Минимум 5 символов"
            minlength="5"
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
