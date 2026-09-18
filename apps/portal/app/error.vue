<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ robots: 'noindex, nofollow' })

function goHome() {
  clearError({ redirect: localePath('/') })
}
</script>

<template>
  <div class="error-page">
    <p class="error-page__status">{{ error.statusCode }}</p>
    <h1 class="error-page__title">
      {{ isNotFound ? t('error.notFoundTitle') : t('error.serverTitle') }}
    </h1>
    <p v-if="isNotFound" class="error-page__desc">{{ t('error.notFoundDesc') }}</p>
    <button type="button" class="btn-primary mt-6" @click="goHome">
      {{ t('error.backHome') }}
    </button>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ic-spacing-4, 16px);
  text-align: center;
}

.error-page__status {
  font-size: var(--ic-font-size-4xl, 36px);
  font-weight: var(--ic-font-weight-bold, 700);
  color: var(--ic-color-brand-500, #2563eb);
}

.error-page__title {
  margin-top: var(--ic-spacing-2, 8px);
  font-size: var(--ic-font-size-xl, 20px);
  font-weight: var(--ic-font-weight-semibold, 600);
}

.error-page__desc {
  margin-top: var(--ic-spacing-2, 8px);
  color: var(--ic-color-text-secondary, #475569);
}
</style>
