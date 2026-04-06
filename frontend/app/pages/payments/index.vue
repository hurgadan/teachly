<script setup lang="ts">
const { payments, studentsWithDebt, formatPrice, monthlyIncome, totalDebt } = useMockData()

const recentPayments = payments.slice(0, 10)
const showPaymentModal = ref(false)
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
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Получено за март</p>
          <p class="text-2xl font-bold mt-1 text-success">{{ formatPrice(monthlyIncome) }}</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Общая задолженность</p>
          <p class="text-2xl font-bold mt-1 text-error">{{ formatPrice(totalDebt) }}</p>
        </div>
      </div>
      <div class="card bg-base-100 shadow-sm col-span-2 lg:col-span-1">
        <div class="card-body p-4">
          <p class="text-xs text-base-content/60 uppercase tracking-wide">Учеников с долгом</p>
          <p class="text-2xl font-bold mt-1">{{ studentsWithDebt.length }}</p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4 lg:gap-6">
      <!-- Payment history -->
      <div class="lg:col-span-2">
        <h2 class="font-semibold mb-3">История оплат</h2>

        <!-- Desktop table -->
        <div class="hidden lg:block card bg-base-100 shadow-sm">
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Ученик</th>
                  <th>Сумма</th>
                  <th>Способ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="payment in recentPayments" :key="payment.id">
                  <td class="text-base-content/70">{{ payment.date }}</td>
                  <td>
                    <NuxtLink :to="`/students/${payment.studentId}`" class="hover:text-primary transition-colors">
                      {{ payment.studentName }}
                    </NuxtLink>
                  </td>
                  <td class="font-medium text-success">+{{ formatPrice(payment.amount) }}</td>
                  <td>
                    <span class="badge badge-sm badge-ghost">{{ payment.method }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Mobile cards -->
        <div class="lg:hidden space-y-2">
          <div
            v-for="payment in recentPayments"
            :key="payment.id"
            class="card bg-base-100 shadow-sm"
          >
            <div class="card-body p-3 flex-row items-center gap-3">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium">{{ payment.studentName }}</p>
                <p class="text-xs text-base-content/50">{{ payment.date }} · {{ payment.method }}</p>
              </div>
              <span class="text-sm font-medium text-success shrink-0">+{{ formatPrice(payment.amount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Debt summary -->
      <div>
        <h2 class="font-semibold mb-3">Задолженности</h2>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4 lg:p-6">
            <div v-if="studentsWithDebt.length === 0" class="text-sm text-base-content/50 text-center py-4">
              Нет задолженностей
            </div>
            <div v-else class="divide-y divide-base-200">
              <NuxtLink
                v-for="student in studentsWithDebt"
                :key="student.id"
                :to="`/students/${student.id}`"
                class="flex items-center justify-between py-3 hover:bg-base-200 -mx-2 px-2 rounded transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="avatar placeholder">
                    <div class="bg-neutral text-neutral-content w-8 rounded-full">
                      <span class="text-xs">{{ student.firstName[0] }}{{ student.lastName[0] }}</span>
                    </div>
                  </div>
                  <span class="text-sm">{{ student.firstName }} {{ student.lastName }}</span>
                </div>
                <span class="text-sm font-medium text-error">{{ formatPrice(student.debt) }}</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ModalsAddPaymentModal :open="showPaymentModal" @close="showPaymentModal = false" @added="showPaymentModal = false" />
  </div>
</template>
