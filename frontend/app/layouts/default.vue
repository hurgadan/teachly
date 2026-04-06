<template>
  <div class="flex h-dvh bg-base-200">
    <LayoutSidebarNav class="hidden lg:flex" />

    <div class="flex flex-1 flex-col min-w-0">
      <LayoutTopBar />
      <main class="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
        <slot />
      </main>
    </div>

    <LayoutMobileDock class="lg:hidden" />
  </div>
</template>
