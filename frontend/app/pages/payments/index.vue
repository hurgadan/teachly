<script setup lang="ts">
import type { Payment } from '~/types/payments'

const { getPayments } = usePaymentsApi()

const payments = ref<Payment[]>([])
const total = ref(0)
const loading = ref(true)
const showPaymentModal = ref(false)

const currentMonthIncome = computed(() => {
  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return payments.value
    .filter(p => p.createdAt.startsWith(monthStr))
    .reduce((sum, p) => sum + p.amount, 0)
})

function formatPrice(amount: number): string {
  return amount.toLocaleString('ru-RU') + ' ₽'
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr))
}

async function loadPayments() {
  try {
    loading.value = true
    const result = await getPayments({ page: 1, limit: 50 })
    payments.value = result.items
    total.value = result.total
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

function onPaymentAdded() {
  showPaymentModal.value = false
  void loadPayments()
}

onMounted(() => {
  void loadPayments()
})
</script>

<template>
  <div>
    <UiPageHeader title="Оплаты">
      <template #actions>
        <button class="btn btn-primary btn-sm" @click="showPaymentModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Добавить оплату
        </button>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Получено за текущий месяц</p>
          <p class="text-2xl font-bold mt-1 text-success">
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            <span v-else>{{ formatPrice(currentMonthIncome) }}</span>
          </p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Всего оплат</p>
          <p class="text-2xl font-bold mt-1">
            <span v-if="loading" class="loading loading-spinner loading-sm" />
            <span v-else>{{ total }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Payment history -->
    <h2 class="font-semibold mb-3">История оплат</h2>

    <div v-if="loading" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="payments.length === 0" class="card bg-base-100 shadow-sm">
      <div class="card-body text-center py-12 text-base-content/50">
        Оплат ещё нет
      </div>
    </div>

    <template v-else>
      <!-- Desktop table -->
      <div class="hidden lg:block card bg-base-100 shadow-sm">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Ученик / Группа</th>
                <th>Комментарий</th>
                <th>Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id">
                <td class="text-base-content/70">{{ formatDate(payment.createdAt) }}</td>
                <td>
                  <NuxtLink
                    v-if="payment.studentId"
                    :to="`/students/${payment.studentId}`"
                    class="hover:text-primary transition-colors"
                  >
                    Ученик
                  </NuxtLink>
                  <span v-else-if="payment.groupId">Группа</span>
                  <span v-else class="text-base-content/40">—</span>
                </td>
                <td class="text-base-content/60">{{ payment.comment || '—' }}</td>
                <td class="font-medium text-success">+{{ formatPrice(payment.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Mobile cards -->
      <div class="lg:hidden space-y-2">
        <div
          v-for="payment in payments"
          :key="payment.id"
          class="card bg-base-100 shadow-sm"
        >
          <div class="card-body p-3 flex-row items-center gap-3">
            <div class="flex-1 min-w-0">
              <NuxtLink
                v-if="payment.studentId"
                :to="`/students/${payment.studentId}`"
                class="text-sm font-medium hover:text-primary"
              >
                Ученик
              </NuxtLink>
              <p v-else class="text-sm font-medium">Группа</p>
              <p class="text-xs text-base-content/50">{{ formatDate(payment.createdAt) }}{{ payment.comment ? ` · ${payment.comment}` : '' }}</p>
            </div>
            <span class="text-sm font-medium text-success shrink-0">+{{ formatPrice(payment.amount) }}</span>
          </div>
        </div>
      </div>
    </template>

    <ModalsAddPaymentModal
      :open="showPaymentModal"
      @close="showPaymentModal = false"
      @added="onPaymentAdded"
    />
  </div>
</template>
