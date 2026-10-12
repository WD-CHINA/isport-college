<script setup lang="ts">
import { ACADEMY_CAPABILITIES } from '~/config/capabilities'

defineProps<{ label?: string }>()
const { t } = useI18n()
</script>

<template>
  <AButton :disabled="!ACADEMY_CAPABILITIES.lingyue.enabled" :title="t('academy.unavailable')">
    {{ label || t('lingyue.enter') }}
  </AButton>
</template>
