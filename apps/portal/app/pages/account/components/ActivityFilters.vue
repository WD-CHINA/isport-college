<script setup lang="ts">
import { CONTENT_CHANNELS, type ContentChannel, type InteractionKind } from '@isport/shared'

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
    <div class="activity-filters__row" role="tablist" :aria-label="t('academy.account')">
      <AButton
        :aria-pressed="kind === 'favorite'"
        role="tab"
        :aria-selected="kind === 'favorite'"
        :type="kind === 'favorite' ? 'primary' : 'default'"
        :disabled="disabled"
        @click="emit('change', 'favorite', channel)"
        >{{ t('account.favorites') }} ({{ totals.favorite }})</AButton
      >
      <AButton
        :aria-pressed="kind === 'like'"
        role="tab"
        :aria-selected="kind === 'like'"
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
        >{{ t(`account.channels.${value}`) }}</AButton
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.activity-filters {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
