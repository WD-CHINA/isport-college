<script setup lang="ts">
import AppFooter from '~/components/app/AppFooter.vue'
import AppHeader from '~/components/app/AppHeader.vue'

const route = useRoute()
const compactFooter = computed(() =>
  /^\/(?:en\/)?(?:account|resources|research|schools|preview\/(?:article|resource)\/(?:resources|research|schools))(?:\/|$)/.test(
    route.path,
  ),
)
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter :compact="compactFooter" />
  </div>
</template>
