<script setup lang="ts">
import type { Payment } from '~/types/payments'

const { getPayments, deletePayment } = usePaymentsApi()
const { show } = useToast()

const payments = ref<Payment[]>([])
const total = ref(0)
const loading = ref(true)
const showPaymentModal = ref(false)
const deletingId = ref<string | null>(null)

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

async function handleDelete(id: string) {
  if (!confirm('Удалить эту оплату?')) return
  try {
    deletingId.value = id
    await deletePayment(id)
    show('Оплата удалена')
    void loadPayments()
  } catch {
    show('Ошибка при удалении оплаты')
  } finally {
    deletingId.value = null
  }
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
                <th />
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
                <td>
                  <button
                    class="btn btn-ghost btn-xs text-error"
                    :disabled="deletingId === payment.id"
                    @click.stop="handleDelete(payment.id)"
                  >
                    <span v-if="deletingId === payment.id" class="loading loading-spinner loading-xs" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </td>
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
            <button
              class="btn btn-ghost btn-xs text-error shrink-0"
              :disabled="deletingId === payment.id"
              @click.stop="handleDelete(payment.id)"
            >
              <span v-if="deletingId === payment.id" class="loading loading-spinner loading-xs" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
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
