<template>
  <div class="shell-grid">
    <UiSidebarNav />

    <div class="mobile-page-shell relative min-w-0">
      <UiTopBar />
      <UiMobileNav />

      <main id="main-content" class="mobile-safe-bottom relative mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-[1500px] min-w-0 flex-col px-4 pb-10 pt-6 md:px-6 lg:px-8 lg:pt-8">
        <slot />
        <div aria-hidden="true" class="mobile-dock-spacer lg:hidden" />
      </main>
    </div>
  </div>
</template>
