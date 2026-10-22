<script setup lang="ts">
import type { InteractionKind, WebContentCard } from '@isport/shared'
import ContentLink from '~/components/content/ContentLink.vue'
import ContentCover from '~/components/content/ContentCover.vue'

defineProps<{
  content: WebContentCard
  kind: InteractionKind
  disabled: boolean
  pending: boolean
}>()
const emit = defineEmits<{ remove: [id: string] }>()
const { t } = useI18n()
</script>

<template>
  <article class="activity-row" :data-content-id="content.contentKey">
    <ContentLink :content="content" class="activity-row__link">
      <span class="activity-row__cover">
        <ContentCover :src="content.coverUrl" :type="content.detailType" :icon-size="28" />
      </span>
      <div class="activity-row__body">
        <h3>{{ content.title }}</h3>
        <span class="activity-row__meta">
          <span class="activity-row__channel">{{
            t(`account.channels.${content.channel.toLowerCase()}`)
          }}</span>
          <span v-if="content.categoryName">{{ content.categoryName }}</span>
        </span>
      </div>
    </ContentLink>
    <div class="activity-row__stats">
      <span :aria-label="t('catalog.views', { count: content.viewCount })">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {{ content.viewCount }}
      </span>
      <component
        :is="kind === 'like' && content.interactive ? 'button' : 'span'"
        :type="kind === 'like' ? 'button' : undefined"
        :disabled="kind === 'like' ? disabled : undefined"
        :aria-label="`${t(kind === 'like' ? 'detail.unlike' : 'detail.like')} · ${content.likeCount}`"
        :aria-pressed="kind === 'like' ? 'true' : undefined"
        :aria-busy="kind === 'like' ? pending : undefined"
        @click="content.interactive && kind === 'like' && emit('remove', content.contentKey)"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 10H3v11h4V10Zm0 0 5-8 2 1v6h6a1 1 0 0 1 1 1l-2 10a1 1 0 0 1-1 1H7V10Z" />
        </svg>
        {{ content.likeCount }}
      </component>
      <component
        :is="kind === 'favorite' && content.interactive ? 'button' : 'span'"
        :type="kind === 'favorite' ? 'button' : undefined"
        :disabled="kind === 'favorite' ? disabled : undefined"
        :aria-label="`${t(kind === 'favorite' ? 'detail.unfavorite' : 'detail.favorite')} · ${content.favoriteCount}`"
        :aria-pressed="kind === 'favorite' ? 'true' : undefined"
        :aria-busy="kind === 'favorite' ? pending : undefined"
        @click="content.interactive && kind === 'favorite' && emit('remove', content.contentKey)"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m12 2 3.1 6.3L22 9.4l-5 4.8 1.2 6.9L12 17.8l-6.2 3.3L7 14.2 2 9.4l6.9-1.1L12 2Z"
          />
        </svg>
        {{ content.favoriteCount }}
      </component>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.activity-row {
  display: flex;
  align-items: center;
  gap: 24px;
  min-height: 116px;
  padding: 16px 0;
  border-bottom: 1px solid var(--ic-color-academy-border-panel);
  color: var(--ic-color-academy-text-primary);

  &__link {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 24px;
    min-width: 0;
    color: inherit;
  }

  &__cover {
    position: relative;
    display: grid;
    place-items: center;
    width: 128px;
    height: 80px;
    flex: none;
    overflow: hidden;
    border-radius: 6px;
    background: var(--ic-color-academy-background-placeholder);
  }

  &__body {
    display: grid;
    gap: 12px;
    min-width: 0;
  }

  h3 {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    overflow-wrap: anywhere;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    color: var(--ic-color-academy-text-caption);
    font-size: 12px;
    line-height: 20px;
  }

  &__channel {
    padding: 2px 12px;
    border-radius: 4px;
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);
  }

  &__stats {
    display: flex;
    flex: none;
    align-items: center;
    gap: 20px;
    color: var(--ic-color-academy-text-caption);
    font-size: 13px;
    line-height: 20px;
  }

  &__stats > * {
    display: inline-flex;
    min-width: 56px;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    white-space: nowrap;
  }

  &__stats svg {
    width: 20px;
    height: 20px;
    flex: none;
    stroke: currentcolor;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__stats button {
    min-height: 44px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  &__stats button svg {
    color: var(--ic-color-academy-primary);
  }

  &__stats button:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  &__stats button:focus-visible {
    outline: 2px solid var(--ic-color-academy-primary);
    outline-offset: 4px;
    border-radius: 4px;
  }
}

@media (max-width: 767px) {
  .activity-row {
    flex-wrap: wrap;
    gap: 8px;

    &__link {
      flex-basis: 100%;
      gap: 12px;
    }

    &__cover {
      width: 88px;
      height: 60px;
    }

    &__body {
      gap: 8px;
    }

    h3 {
      font-size: 14px;
      line-height: 22px;
    }

    &__meta {
      gap: 8px;
      font-size: 11px;
    }

    &__channel {
      padding-inline: 6px;
    }

    &__stats {
      margin-left: auto;
      gap: 12px;
      font-size: 12px;
    }

    &__stats > * {
      min-width: 44px;
      gap: 6px;
    }

    &__stats svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
