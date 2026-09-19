<script setup lang="ts">
import { Button as AButton, Empty as AEmpty } from 'antdv-next'
const emit = defineEmits<{
  reset: []
}>()

const { t } = useI18n()
</script>

<template>
  <AEmpty :description="t('course.emptyResult')">
    <p class="course-empty-state__description">{{ t('course.tryOtherFilter') }}</p>
    <AButton @click="emit('reset')">{{ t('common.reset') }}</AButton>
  </AEmpty>
</template>

<style scoped>
.course-empty-state__description {
  margin-bottom: var(--ic-spacing-3, 12px);
  color: var(--ic-color-text-tertiary, #94a3b8);
}
</style>
