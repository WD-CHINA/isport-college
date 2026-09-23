<script setup lang="ts">
import { CONTENT_CHANNELS, type ContentChannel, type InteractionKind } from '@isport/shared'
import { Button as AButton } from 'antdv-next'

defineProps<{
  kind: InteractionKind
  channel: ContentChannel | ''
  totals: { like: number; favorite: number }
  disabled: boolean
}>()
const emit = defineEmits<{ change: [kind: InteractionKind, channel: ContentChannel | ''] }>()
const { t } = useI18n()
</script>

<template>
  <div class="activity-filters">
    <div class="activity-filters__row" :aria-label="t('academy.account')">
      <AButton
        :aria-pressed="kind === 'favorite'"
        :type="kind === 'favorite' ? 'primary' : 'default'"
        :disabled="disabled"
        @click="emit('change', 'favorite', channel)"
        >{{ t('account.favorites') }} ({{ totals.favorite }})</AButton
      >
      <AButton
        :aria-pressed="kind === 'like'"
        :type="kind === 'like' ? 'primary' : 'default'"
        :disabled="disabled"
        @click="emit('change', 'like', channel)"
        >{{ t('account.likes') }} ({{ totals.like }})</AButton
      >
    </div>
    <div class="activity-filters__row" :aria-label="t('catalog.category')">
      <AButton :aria-pressed="!channel" :disabled="disabled" @click="emit('change', kind, '')">{{
        t('common.all')
      }}</AButton>
      <AButton
        v-for="value in CONTENT_CHANNELS"
        :key="value"
        :aria-pressed="channel === value"
        :disabled="disabled"
        @click="emit('change', kind, value)"
        >{{ t(`catalog.channels.${value}`) }}</AButton
      >
    </div>
  </div>
</template>

<style scoped>
.activity-filters {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.activity-filters__row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
