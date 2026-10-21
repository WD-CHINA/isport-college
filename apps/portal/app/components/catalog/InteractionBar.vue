<script setup lang="ts">
import type { ContentStats, InteractionKind } from '@isport/shared'

defineProps<{ stats: ContentStats; pending: boolean }>()
const emit = defineEmits<{ change: [kind: InteractionKind, active: boolean] }>()
const { t } = useI18n()
</script>

<template>
  <div class="interaction-bar">
    <span data-testid="view-count" :aria-label="t('catalog.views', { count: stats.views })">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {{ stats.views }}
    </span>
    <button
      type="button"
      :disabled="pending"
      :aria-pressed="stats.liked"
      :aria-label="`${t(stats.liked ? 'detail.unlike' : 'detail.like')} · ${stats.likes}`"
      @click="emit('change', 'like', !stats.liked)"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 10H3v11h4V10Zm0 0 5-8 2 1v6h6a1 1 0 0 1 1 1l-2 10a1 1 0 0 1-1 1H7V10Z" />
      </svg>
      {{ stats.likes }}
    </button>
    <button
      type="button"
      :disabled="pending"
      :aria-pressed="stats.favorited"
      :aria-label="`${t(stats.favorited ? 'detail.unfavorite' : 'detail.favorite')} · ${stats.favorites}`"
      @click="emit('change', 'favorite', !stats.favorited)"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m12 2 3.1 6.3L22 9.4l-5 4.8 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.4l6.9-1.1L12 2Z" />
      </svg>
      {{ stats.favorites }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.interaction-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: fit-content;
  min-height: 52px;
  max-width: 100%;
  gap: var(--ic-spacing-8);
  padding: 0 var(--ic-spacing-4);
  color: var(--ic-color-academy-text-caption);
  font-size: 14px;
  line-height: 21px;

  > span,
  button {
    display: inline-flex;
    align-items: center;
    gap: var(--ic-spacing-2);
  }

  svg {
    width: 22px;
    height: 22px;
    flex: none;
    stroke: currentcolor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  > span svg {
    width: 20px;
    height: 20px;
  }

  button {
    min-height: 44px;
    padding: 0;
    border: 0;
    border-radius: var(--ic-border-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;

    svg {
      color: var(--ic-color-academy-primary);
    }

    &[aria-pressed='true'] svg {
      fill: var(--ic-color-academy-tint);
    }

    &:disabled {
      cursor: wait;
      opacity: 0.5;
    }

    &:focus-visible {
      outline: 2px solid var(--ic-color-academy-primary);
      outline-offset: 4px;
    }
  }
}
</style>
