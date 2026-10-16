<script setup lang="ts">
import AppHeader from '~/components/app/AppHeader.vue'

const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <div class="creation-layout">
    <AppHeader creation-center />
    <main class="creation-layout__main"><slot /></main>
    <footer class="creation-layout__footer">
      {{ t('seo.siteName') }} © {{ year }} {{ t('footer.company') }}
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.creation-layout {
  min-height: 100vh;
  background: #fbfdff;
  color: var(--ic-color-academy-text-primary, #1c1f23);

  &__main {
    min-height: calc(100vh - 136px);
  }

  &__footer {
    padding: 28px 20px;
    color: #8a97a4;
    font-size: 11px;
    line-height: 14px;
    text-align: center;
  }
}
</style>
