<script setup lang="ts">
import { SUBMISSION_KINDS, type SubmissionKind } from '@isport/shared'
import { Button as AButton } from 'antdv-next'

defineEmits<{ select: [kind: SubmissionKind] }>()
const { t } = useI18n()
</script>

<template>
  <section class="creation-types">
    <AButton
      v-for="kind in SUBMISSION_KINDS"
      :key="kind"
      size="large"
      class="creation-types__item"
      @click="$emit('select', kind)"
      >{{ t(`creation.entries.${kind}`) }}</AButton
    >
  </section>
</template>

<style scoped>
.creation-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 18px;
  margin: 32px 0;
}

.creation-types__item {
  min-height: 108px;
  padding: 20px 16px;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
  font-size: var(--ic-font-size-base, 16px);
  font-weight: var(--ic-font-weight-medium, 500);
  white-space: normal;
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));
  transition:
    transform var(--ic-motion-duration-normal, 250ms) var(--ic-motion-easing-standard),
    box-shadow var(--ic-motion-duration-normal, 250ms) var(--ic-motion-easing-standard),
    border-color var(--ic-motion-duration-fast, 150ms) var(--ic-motion-easing-standard);
}

.creation-types__item:hover {
  transform: translateY(-3px);
  border-color: var(--ic-color-brand-300, #93c5fd);
  box-shadow: var(--ic-box-shadow-md, 0 4px 12px -2px rgb(15 23 42 / 10%));
}
</style>
