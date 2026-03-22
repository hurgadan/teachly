<script setup lang="ts">
const payments = [
  { name: 'Анна Петрова', charged: 4800, paid: 0, status: 'Напомнить до 25 марта' },
  { name: 'Марат Ильясов', charged: 6400, paid: 6400, status: 'Баланс закрыт' },
  { name: 'Ольга Соколова', charged: 2000, paid: 0, status: 'Ждет переноса и оплаты' },
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
</script>

<template>
  <div class="w-full min-w-0">
    <UiPageHeader
      title="Оплаты"
    />

    <section class="space-y-4">
      <section class="flex flex-wrap gap-x-6 gap-y-2 border-b border-base-200 pb-2 text-sm">
        <p><span class="font-semibold">₽13 200</span> к оплате</p>
        <p><span class="font-semibold text-success">₽6 400</span> оплачено</p>
        <p><span class="font-semibold text-error">₽6 800</span> долг</p>
      </section>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
      <div class="space-y-4">
        <div class="grid gap-3 xl:hidden">
          <article v-for="payment in payments" :key="payment.name" class="card border border-base-200 bg-base-100 shadow-sm">
            <div class="card-body p-4">
            <div class="flex items-start justify-between gap-3">
              <p class="min-w-0 text-base font-semibold">{{ payment.name }}</p>
              <span class="text-number text-sm font-bold" :class="payment.charged - payment.paid > 0 ? 'text-error' : 'text-success'">
                {{ formatCurrency(payment.charged - payment.paid) }}
              </span>
            </div>

            <dl class="mt-4 grid gap-2 text-sm">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-base-content/60">К оплате</dt>
                <dd class="text-number font-semibold">{{ formatCurrency(payment.charged) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-base-content/60">Оплачено</dt>
                <dd class="text-number font-semibold">{{ formatCurrency(payment.paid) }}</dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-base-content/60">Долг</dt>
                <dd class="text-number font-semibold" :class="payment.charged - payment.paid > 0 ? 'text-error' : 'text-success'">
                  {{ formatCurrency(payment.charged - payment.paid) }}
                </dd>
              </div>
            </dl>

            <p class="mt-4 text-sm leading-6 text-base-content/72">{{ payment.status }}</p>
            </div>
          </article>
        </div>

        <div class="hidden overflow-hidden xl:block">
          <div class="overflow-x-auto">
          <table class="table border border-base-200 bg-base-100">
            <thead>
              <tr>
                <th>Ученик</th>
                <th>К оплате</th>
                <th>Оплачено</th>
                <th>Долг</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.name" class="hover">
                <td class="font-semibold">{{ payment.name }}</td>
                <td class="text-number">{{ formatCurrency(payment.charged) }}</td>
                <td class="text-number">{{ formatCurrency(payment.paid) }}</td>
                <td class="text-number font-semibold" :class="payment.charged - payment.paid > 0 ? 'text-error' : 'text-success'">
                  {{ formatCurrency(payment.charged - payment.paid) }}
                </td>
                <td class="text-sm text-base-content/72">{{ payment.status }}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>
      </div>
    </section>
  </div>
</template>
