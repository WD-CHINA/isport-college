<script setup lang="ts">
import { formatPublishedAt, isContentAssetUrl, type WebContentCard } from '@isport/shared'
import ContentMediaTag from './ContentMediaTag.vue'
import ContentLink from './ContentLink.vue'
import ContentTypeIcon from './ContentTypeIcon.vue'
import { useApiUrl } from '~/utils/api-url'
import { useContentLevelLabel } from '~/composables/useContentLevelLabel'

const props = defineProps<{
  content: WebContentCard
  variant?: 'default' | 'catalog'
}>()
const { t } = useI18n()
const apiUrl = useApiUrl()
const getLevelLabel = useContentLevelLabel()
const imageFailed = shallowRef(false)
const coverUrl = computed(() => apiUrl(props.content.coverUrl))
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
const publisher = computed(
  () => props.content.publisherName || props.content.authorName || props.content.schoolName,
)
const levelLabel = computed(() => getLevelLabel(props.content))
watch(
  () => props.content.coverUrl,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <article
    class="content-card"
    :class="[
      variant === 'catalog' && 'content-card--catalog',
      `content-card--${content.channel.toLowerCase()}`,
    ]"
    :data-content-id="content.contentKey"
  >
    <ContentLink :content="content" class="content-card__link">
      <div class="content-card__cover">
        <img
          v-if="isContentAssetUrl(coverUrl) && !imageFailed"
          class="content-card__photo"
          :src="coverUrl"
          alt=""
          loading="lazy"
          width="640"
          height="360"
          @error="imageFailed = true"
        />
        <ContentTypeIcon v-else :type="content.detailType" :size="40" />
        <span v-if="variant !== 'catalog'" class="content-card__kind">{{
          t(`catalog.media.${kind}`)
        }}</span>
      </div>
      <div class="content-card__body">
        <ContentMediaTag
          v-if="variant === 'catalog' && content.channel === 'RESOURCE'"
          :type="content.detailType"
        />
        <span
          v-if="variant === 'catalog' && content.channel !== 'RESOURCE' && content.categoryName"
          class="content-card__category"
          >{{ content.categoryName }}</span
        >
        <h3>{{ content.title }}</h3>
        <div
          v-if="
            variant === 'catalog' && content.channel === 'RESOURCE' && (publisher || levelLabel)
          "
          class="content-card__foot"
        >
          <span class="content-card__publisher">{{ publisher }}</span>
          <span v-if="levelLabel" class="content-card__level">{{ levelLabel }}</span>
        </div>
        <p v-if="variant !== 'catalog'">{{ content.summary }}</p>
        <div v-if="variant !== 'catalog'" class="content-card__meta">
          <span v-if="content.categoryName">{{ content.categoryName }}</span>
          <span v-if="content.channel === 'SCHOOL' && (content.provinceName || content.schoolName)"
            >{{ content.provinceName }} · {{ content.schoolName }}</span
          >
          <span>{{ t('catalog.views', { count: content.viewCount }) }}</span>
          <time v-if="published" :datetime="published">{{ published }}</time>
        </div>
        <span
          v-if="variant === 'catalog' && content.channel !== 'RESOURCE'"
          class="content-card__cta"
          >{{ t('catalog.viewCase') }} →</span
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
  transition:
    transform var(--ic-motion-duration-normal, 250ms) var(--ic-motion-easing-standard),
    box-shadow var(--ic-motion-duration-normal, 250ms) var(--ic-motion-easing-standard),
    border-color var(--ic-motion-duration-fast, 150ms) var(--ic-motion-easing-standard);

  &:hover {
    transform: translateY(-3px);
    border-color: var(--ic-color-border-strong, #cbd5e1);
    box-shadow: var(--ic-box-shadow-lg, 0 12px 32px -8px rgb(15 23 42 / 16%));
  }

  &__link {
    display: block;
    flex: 1;
    color: inherit;

    &:hover h3 {
      color: var(--ic-color-brand-500, #2563eb);
    }
  }

  &__cover {
    position: relative;
    display: grid;
    place-items: center;
    aspect-ratio: 16 / 9;
    background: linear-gradient(135deg, #eaf1ff 0%, #f5f8ff 100%);
    color: var(--ic-color-text-tertiary, #94a3b8);
    font-size: var(--ic-font-size-sm, 14px);
  }

  &__photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--ic-motion-duration-slow, 400ms) var(--ic-motion-easing-standard);
  }

  &:hover .content-card__photo {
    transform: scale(1.04);
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
    gap: 12px;
    padding: 18px;
  }

  h3 {
    margin: 0;
    font-size: var(--ic-font-size-lg, 17px);
    line-height: var(--ic-line-height-normal, 1.5);
    overflow-wrap: anywhere;
    transition: color var(--ic-motion-duration-fast, 150ms) var(--ic-motion-easing-standard);
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

  &--catalog .content-card__cover {
    overflow: hidden;
  }

  &--catalog .content-card__photo {
    position: absolute;
    inset: 0;
  }

  &--catalog .content-card__body {
    gap: 8px;
    padding: 16px 24px 24px;
  }

  &--catalog.content-card--resource {
    min-height: 278px;
  }

  &--catalog.content-card--resource h3 {
    font-size: 16px;
    font-weight: 500;
    line-height: 22px;
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  &__publisher {
    min-width: 0;
    overflow: hidden;
    flex: 1;
    color: var(--ic-color-academy-text-secondary);
    font-size: 12px;
    font-weight: 500;
    line-height: 22px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__level {
    flex: none;
    height: 20px;
    margin-left: auto;
    padding: 0 6px;
    border-radius: 4px;
    background: var(--ic-color-academy-media-background);
    color: var(--ic-color-academy-media-text);
    font-size: 10px;
    font-weight: 500;
    line-height: 20px;
  }

  &--catalog:not(.content-card--resource) {
    border: 1px solid var(--catalog-border);
    box-shadow: none;
  }

  &--catalog:not(.content-card--resource) .content-card__cover {
    aspect-ratio: 585 / 300;
  }

  &--catalog:not(.content-card--resource) .content-card__body {
    min-height: 171.5px;
    gap: 12px;
    padding: 23px 25px 25px;
  }

  &--catalog:not(.content-card--resource) h3 {
    font-size: 20px;
    font-weight: 500;
    line-height: 32px;
  }

  &__category {
    width: fit-content;
    padding: 5px 8px;
    border-radius: 3px;
    background: var(--ic-color-academy-tint);
    color: var(--catalog-primary);
    font-size: 11px;
    line-height: 13px;
  }

  &__cta {
    width: fit-content;
    margin-top: 12px;
    padding: 9px 12px;
    border-radius: 4px;
    background: var(--ic-color-academy-tint);
    color: var(--catalog-primary);
    font-size: 12px;
    line-height: 14px;
  }
}

@media (max-width: 767px) {
  .content-card {
    &--catalog:not(.content-card--resource) h3 {
      font-size: 18px;
    }
  }
}
</style>
