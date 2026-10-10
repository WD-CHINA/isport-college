<script setup lang="ts">
import {
  formatPublishedAt,
  isContentAssetUrl,
  webContentPath,
  type WebContentCard,
} from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

const props = defineProps<{ content: WebContentCard }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const imageFailed = shallowRef(false)
const href = computed(() => localePath(webContentPath(props.content)))
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
watch(
  () => props.content.coverUrl,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <article class="content-card" :data-content-id="content.contentKey">
    <NuxtLink :to="href" class="content-card__link">
      <div class="content-card__cover">
        <img
          v-if="isContentAssetUrl(coverUrl) && !imageFailed"
          :src="coverUrl"
          alt=""
          loading="lazy"
          width="640"
          height="360"
          @error="imageFailed = true"
        />
        <span v-else>{{ t('catalog.noCover') }}</span>
        <span class="content-card__kind">{{ t(`catalog.media.${kind}`) }}</span>
      </div>
      <div class="content-card__body">
        <h3>{{ content.title }}</h3>
        <p>{{ content.summary }}</p>
        <div class="content-card__meta">
          <span v-if="content.categoryName">{{ content.categoryName }}</span>
          <span v-if="content.channel === 'SCHOOL' && (content.provinceName || content.schoolName)"
            >{{ content.provinceName }} · {{ content.schoolName }}</span
          >
          <span>{{ t('catalog.views', { count: content.viewCount }) }}</span>
          <time v-if="published" :datetime="published">{{ published }}</time>
        </div>
      </div>
    </NuxtLink>
    <slot />
  </article>
</template>

<style scoped>
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
}

.content-card:hover {
  transform: translateY(-3px);
  border-color: var(--ic-color-border-strong, #cbd5e1);
  box-shadow: var(--ic-box-shadow-lg, 0 12px 32px -8px rgb(15 23 42 / 16%));
}

.content-card__link {
  display: block;
  flex: 1;
  color: inherit;
}

.content-card__link:hover h3 {
  color: var(--ic-color-brand-500, #2563eb);
}

.content-card__cover {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #eaf1ff 0%, #f5f8ff 100%);
  color: var(--ic-color-text-tertiary, #94a3b8);
  font-size: var(--ic-font-size-sm, 14px);
}

.content-card__cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--ic-motion-duration-slow, 400ms) var(--ic-motion-easing-standard);
}

.content-card:hover .content-card__cover img {
  transform: scale(1.04);
}

.content-card__kind {
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

.content-card__body {
  display: grid;
  gap: 12px;
  padding: 18px;
}

.content-card h3 {
  margin: 0;
  font-size: var(--ic-font-size-lg, 17px);
  line-height: var(--ic-line-height-normal, 1.5);
  overflow-wrap: anywhere;
  transition: color var(--ic-motion-duration-fast, 150ms) var(--ic-motion-easing-standard);
}

.content-card p {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
  color: var(--ic-color-text-secondary, #64748b);
  font-size: var(--ic-font-size-sm, 14px);
}

.content-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: var(--ic-font-size-xs, 12px);
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.content-card__external {
  font-size: var(--ic-font-size-sm, 13px);
  font-weight: var(--ic-font-weight-medium, 500);
  color: var(--ic-color-brand-500, #2563eb);
}
</style>
