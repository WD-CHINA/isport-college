<script setup lang="ts">
import { Result as AResult } from 'antdv-next'

definePageMeta({ middleware: 'auth' })
const { t } = useI18n()
const { state } = useLingyue()
const auth = useAuthStore()
const successful = computed(() => Boolean(auth.user && state.value.successfulUser === auth.user.id))
useSeoMeta({ title: () => t('lingyue.title') })
</script>

<template>
  <AResult
    :status="successful ? 'success' : 'info'"
    :title="t(successful ? 'lingyue.success' : 'lingyue.idle')"
    :sub-title="t(successful ? 'lingyue.successDescription' : 'lingyue.notice')"
  >
    <template #extra><LingyueButton /></template>
  </AResult>
</template>
