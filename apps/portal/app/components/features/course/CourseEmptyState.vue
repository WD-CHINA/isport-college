<script setup lang="ts">
import { UiEmptyState } from '@isport/ui-core'
const emit = defineEmits<{
  reset: []
}>()

const { t } = useI18n()
</script>

<template>
  <UiEmptyState :title="t('course.emptyResult')" :description="t('course.tryOtherFilter')">
    <button type="button" class="btn-outline" @click="emit('reset')">
      {{ t('common.reset') }}
    </button>
  </UiEmptyState>
</template>
