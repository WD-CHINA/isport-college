<script setup lang="ts">
import { formatPublishedAt, type WebContentCard } from '@isport/shared'
import ContentCover from './ContentCover.vue'
import ContentMediaTag from './ContentMediaTag.vue'
import ContentLink from './ContentLink.vue'
import ContentTypeIcon from './ContentTypeIcon.vue'
import { useContentLevelLabel } from '~/composables/useContentLevelLabel'

const props = defineProps<{
  content: WebContentCard
  variant?: 'default' | 'catalog' | 'resource-recommendation'
}>()
const { t } = useI18n()
const getLevelLabel = useContentLevelLabel()
const kind = computed(() => {
  const kinds = {
    VIDEO: 'video',
    AUDIO: 'audio',
    DOCUMENT: 'pdf',
    IMAGE: 'image',
    LINK: 'link',
    ARTICLE: 'article',
  } as const
  return kinds[props.content.detailType]
})
const published = computed(() => formatPublishedAt(props.content.publishedAt))
const levelLabel = computed(() => getLevelLabel(props.content))
const defaultVariant = computed(() => !props.variant || props.variant === 'default')
</script>

<template>
  <article
    class="content-card card-feedback"
    :class="[
      variant === 'catalog' && 'content-card--catalog',
      variant === 'resource-recommendation' && 'content-card--recommendation',
      `content-card--${content.channel.toLowerCase()}`,
    ]"
    :data-content-id="content.contentKey"
  >
    <ContentLink :content="content" class="content-card__link card-feedback__link">
      <div class="content-card__cover">
        <ContentCover :src="content.coverUrl" :type="content.detailType" />
        <span v-if="defaultVariant" class="content-card__kind">{{
          t(`catalog.media.${kind}`)
        }}</span>
      </div>
      <div class="content-card__body">
        <div
          v-if="variant === 'catalog' && content.channel === 'RESOURCE'"
          class="content-card__resource-meta"
        >
          <ContentMediaTag :type="content.detailType" />
          <span
            class="content-card__views"
            :aria-label="t('catalog.views', { count: content.viewCount })"
          >
            <img src="/home/figma/resource-views.svg" width="14" height="14" alt="" />
            {{ content.viewCount }}
          </span>
        </div>
        <span
          v-if="variant === 'catalog' && content.channel === 'RESEARCH' && content.categoryName"
          class="content-card__category"
          >{{ content.categoryName }}</span
        >
        <h3 class="card-feedback__title" :title="content.title">{{ content.title }}</h3>
        <small
          v-if="variant === 'catalog' && content.channel === 'RESOURCE' && levelLabel"
          class="content-card__suitable"
        >
          {{ t('home.suitable', { name: levelLabel }) }}
        </small>
        <p
          v-if="
            content.summary.trim() &&
            (defaultVariant || (variant === 'catalog' && content.channel === 'SCHOOL'))
          "
          class="content-card__summary"
        >
          {{ content.summary }}
        </p>
        <div v-if="defaultVariant" class="content-card__meta">
          <span v-if="content.categoryName">{{ content.categoryName }}</span>
          <span v-if="content.channel === 'SCHOOL' && (content.provinceName || content.schoolName)"
            >{{ content.provinceName }} · {{ content.schoolName }}</span
          >
          <span>{{ t('catalog.views', { count: content.viewCount }) }}</span>
          <time v-if="published" :datetime="published">{{ published }}</time>
        </div>
        <div v-if="variant === 'resource-recommendation'" class="content-card__recommendation-meta">
          <ContentTypeIcon :type="content.detailType" :size="14" />
          <span>{{ content.categoryName }}</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12h16m-6-6 6 6-6 6" />
          </svg>
        </div>
        <span
          v-if="variant === 'catalog' && content.channel === 'RESEARCH'"
          class="content-card__cta action-feedback"
          >{{ t('catalog.viewCase') }}
          <span class="action-feedback__arrow" aria-hidden="true">→</span></span
        >
      </div>
    </ContentLink>
    <slot />
  </article>
</template>

<style lang="scss" scoped>
.content-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--ic-color-border-base, #e2e8f0);
  border-radius: var(--ic-border-radius-xl, 14px);
  background: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-sm, 0 1px 2px 0 rgb(15 23 42 / 6%));

  &__link {
    display: block;
    flex: 1;
    color: inherit;
  }

  &__cover {
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
    background: linear-gradient(135deg, #eaf1ff 0%, #f5f8ff 100%);
    color: var(--ic-color-text-tertiary, #94a3b8);
    font-size: var(--ic-font-size-sm, 14px);

    &::before {
      grid-area: 1 / 1;
      width: 100%;
      padding-top: 56.25%;
      content: '';
    }
  }

  &__kind {
    position: absolute;
    bottom: 10px;
    left: 10px;
    padding: 3px 9px;
    border-radius: var(--ic-border-radius-md, 6px);
    background: rgb(255 255 255 / 92%);
    color: var(--ic-color-brand-600, #1d4ed8);
    font-size: var(--ic-font-size-xs, 12px);
    font-weight: var(--ic-font-weight-medium, 500);
    backdrop-filter: blur(4px);
  }

  &__body {
    display: grid;
    min-width: 0;
    gap: 12px;
    padding: 18px;
  }

  h3 {
    margin: 0;
    font-size: var(--ic-font-size-lg, 17px);
    line-height: var(--ic-line-height-normal, 1.5);
    overflow-wrap: anywhere;
  }

  p {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin: 0;
    color: var(--ic-color-text-secondary, #64748b);
    font-size: var(--ic-font-size-sm, 14px);
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    font-size: var(--ic-font-size-xs, 12px);
    color: var(--ic-color-text-tertiary, #94a3b8);
  }

  &__external {
    font-size: var(--ic-font-size-sm, 13px);
    font-weight: var(--ic-font-weight-medium, 500);
    color: var(--ic-color-brand-500, #2563eb);
  }

  &--catalog {
    min-width: 0;
    border: 0;
    border-radius: 12px;
    box-shadow: inset 0 0 0 1px var(--catalog-border);
  }

  &--catalog .content-card__body {
    gap: 8px;
    padding: 16px 24px 24px;
  }

  &--catalog.content-card--resource h3 {
    display: -webkit-box;
    min-width: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
    text-overflow: ellipsis;
    white-space: normal;
  }

  &__resource-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__suitable {
    color: var(--ic-color-academy-text-secondary);
    font-size: 12px;
    font-weight: 500;
    line-height: 22px;
  }

  &__views {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 4px;
    margin-inline-start: auto;
    color: #77797b;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    white-space: nowrap;

    img {
      display: block;
      flex: none;
    }
  }

  &--catalog:not(.content-card--resource) {
    border: 1px solid var(--catalog-border);
    box-shadow: none;
  }

  &--catalog.content-card--research .content-card__cover::before {
    padding-top: 51.2821%;
  }

  &--catalog.content-card--research .content-card__body {
    min-height: 171.5px;
    gap: 12px;
    padding: 23px 25px 25px;
  }

  &--catalog.content-card--research h3 {
    font-size: 20px;
    font-weight: 500;
    line-height: 32px;
  }

  &--catalog.content-card--school {
    min-height: 368px;
    padding: var(--ic-spacing-6);
    border: 0;
    box-shadow: inset 0 0 0 1px var(--catalog-border);
  }

  &--catalog.content-card--school .content-card__cover {
    border-radius: 6px;

    &::before {
      padding-top: 55.9524%;
    }
  }

  &--catalog.content-card--school .content-card__body {
    gap: var(--ic-spacing-3);
    padding: var(--ic-spacing-6) 0 0;
  }

  &--catalog.content-card--school h3 {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
  }

  &--catalog.content-card--school p {
    color: var(--ic-color-academy-text-secondary);
    font-size: 12px;
    line-height: 1.8;
  }

  &__category {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 3px;
    background: var(--ic-color-academy-tag-background);
    color: var(--ic-color-academy-tag-text);
    font-size: 11px;
    line-height: 13px;
  }

  &__cta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: fit-content;
    margin-top: 12px;
    padding: 9px 12px;
    border-radius: 4px;
    background: var(--action-feedback-background, var(--ic-color-academy-tint));
    color: var(--catalog-primary);
    font-size: 12px;
    line-height: 14px;
  }

  &--recommendation {
    min-height: 226px;
    border-color: var(--ic-color-academy-border-panel);
    border-radius: var(--ic-border-radius-lg);
    box-shadow: none;
  }

  &--recommendation .content-card__cover {
    height: 140px;

    &::before {
      display: none;
    }
  }

  &--recommendation .content-card__body {
    gap: 8px;
    padding: 12px 18px 16px;
  }

  &--recommendation h3 {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 17px;
    font-weight: 600;
    line-height: 26px;
  }

  &__recommendation-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--ic-color-academy-text-caption);
    font-size: 12px;
    line-height: 18px;

    > svg {
      width: 22px;
      height: 22px;
      margin-inline-start: auto;
      color: var(--ic-color-academy-primary);
      stroke: currentcolor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }
}

@media (max-width: 767px) {
  .content-card {
    &--catalog.content-card--research h3 {
      font-size: 18px;
      line-height: 28px;
    }

    &--catalog.content-card--research .content-card__body {
      padding: var(--ic-spacing-5);
    }

    &--catalog.content-card--school {
      min-height: 0;
      padding: var(--ic-spacing-5);
    }

    &--catalog.content-card--school .content-card__body {
      padding-top: var(--ic-spacing-4);
    }
  }
}
</style>
