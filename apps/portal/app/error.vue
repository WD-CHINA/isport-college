<script setup lang="ts">
import type { NuxtError } from '#app'
import { Button as AButton, Result as AResult } from 'antdv-next'

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
  <AResult
    class="error-page"
    :status="isNotFound ? '404' : '500'"
    :title="String(error.statusCode)"
    :sub-title="isNotFound ? t('error.notFoundDesc') : t('error.serverTitle')"
  >
    <template #extra>
      <AButton type="primary" @click="goHome">{{ t('error.backHome') }}</AButton>
    </template>
  </AResult>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  padding-top: 20vh;
}
</style>
