<script setup lang="ts">
import AppFooter from '~/components/app/AppFooter.vue'
import AppHeader from '~/components/app/AppHeader.vue'
// C 端默认布局：Header + 内容 + Footer
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
