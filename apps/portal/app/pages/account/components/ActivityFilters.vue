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
    <div class="activity-filters__tabs" role="tablist" :aria-label="t('academy.account')">
      <button
        v-for="value in ['favorite', 'like'] as const"
        :key="value"
        type="button"
        role="tab"
        :aria-selected="kind === value"
        :aria-pressed="kind === value"
        :aria-label="`${t(value === 'favorite' ? 'account.favorites' : 'account.likes')} (${totals[value]})`"
        :disabled="disabled"
        @click="emit('change', value, channel)"
      >
        {{ t(value === 'favorite' ? 'account.favorites' : 'account.likes') }}
        <span aria-hidden="true">{{ totals[value] }}</span>
      </button>
    </div>
    <div class="activity-filters__categories" role="group" :aria-label="t('catalog.category')">
      <button
        type="button"
        :aria-pressed="!channel"
        :disabled="disabled"
        @click="emit('change', kind, '')"
      >
        {{ t('common.all') }}
      </button>
      <button
        v-for="value in CONTENT_CHANNELS"
        :key="value"
        type="button"
        :aria-pressed="channel === value"
        :disabled="disabled"
        @click="emit('change', kind, value)"
      >
        {{ t(`account.channels.${value}`) }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.activity-filters {
  display: grid;
  gap: 16px;
  color: var(--ic-color-academy-text-caption);

  button {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  button:focus-visible {
    outline: 2px solid var(--ic-color-academy-primary);
    outline-offset: 3px;
  }

  &__tabs {
    display: flex;
    gap: 36px;
    border-bottom: 1px solid var(--ic-color-academy-border-panel);
  }

  &__tabs button {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 48px;
    padding: 0 0 20px;
    border-bottom: 2px solid transparent;
    font-size: 18px;
    font-weight: 500;
    line-height: 27px;
    white-space: nowrap;
  }

  &__tabs span {
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
  }

  &__tabs [aria-selected='true'] {
    border-bottom-color: var(--ic-color-academy-primary);
    color: var(--ic-color-academy-primary);
  }

  &__categories {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 24px;
  }

  &__categories button {
    min-height: 40px;
    padding: 0 18px;
    border-radius: 6px;
    font-size: 14px;
    line-height: 21px;
  }

  &__categories [aria-pressed='true'] {
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);
  }
}

@media (max-width: 767px) {
  .activity-filters {
    &__tabs {
      gap: 24px;
    }

    &__tabs button {
      gap: 8px;
      font-size: 16px;
    }

    &__categories {
      gap: 4px;
    }

    &__categories button {
      padding-inline: 12px;
      font-size: 13px;
    }
  }
}
</style>
