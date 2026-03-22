<template>
  <div class="w-full min-w-0">
    <UiPageHeader title="Состав группы Evening A2" />

    <section class="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <section class="card border border-base-200 bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">Участники</h2>

          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Уровень</th>
                  <th>Цена</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Анна Петрова</td>
                  <td><span class="badge badge-primary badge-soft">A2</span></td>
                  <td class="text-number whitespace-nowrap">₽2 400</td>
                  <td>Активный</td>
                </tr>
                <tr>
                  <td>Марина Орлова</td>
                  <td><span class="badge badge-primary badge-soft">A2</span></td>
                  <td class="text-number whitespace-nowrap">₽2 400</td>
                  <td>Активный</td>
                </tr>
                <tr>
                  <td>Игорь Смирнов</td>
                  <td><span class="badge badge-primary badge-soft">A1+</span></td>
                  <td class="text-number whitespace-nowrap">₽2 200</td>
                  <td>Активный</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside class="card border border-base-200 bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title">Параметры группы</h2>
          <div class="space-y-3 text-sm">
            <p><span class="font-semibold">Расписание:</span> Пн, Ср 18:30</p>
            <p><span class="font-semibold">Длительность:</span> 90 мин</p>
            <p><span class="font-semibold">Формат:</span> Английский для взрослых</p>
          </div>
          <div class="card-actions justify-start">
            <NuxtLink class="btn btn-primary" to="/calendar">Открыть в календаре</NuxtLink>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>
