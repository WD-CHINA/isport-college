<script setup lang="ts">
import { contentPath, safeExternalUrl, isLocalImageUrl, type AcademyContent } from '@isport/shared'

const props = defineProps<{ content: AcademyContent }>()
const { t } = useI18n()
const localize = useLocalizedText()
const localePath = useLocalePath()
const imageFailed = shallowRef(false)
const external = computed(() => props.content.media.kind === 'link')
const href = computed(() =>
  external.value
    ? safeExternalUrl(props.content.media.url)
      ? props.content.media.url
      : undefined
    : localePath(contentPath(props.content)),
)
watch(
  () => props.content.cover,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <article class="content-card" :data-content-id="content.id">
    <NuxtLink
      :to="href"
      :external="external"
      :target="external ? '_blank' : undefined"
      :rel="external ? 'noopener noreferrer' : undefined"
      class="content-card__link"
    >
      <div class="content-card__cover">
        <img
          v-if="isLocalImageUrl(content.cover) && !imageFailed"
          :src="content.cover"
          alt=""
          loading="lazy"
          width="640"
          height="360"
          @error="imageFailed = true"
        />
        <span v-else>{{ t('catalog.noCover') }}</span>
        <span class="content-card__kind"
          >{{ t(`catalog.media.${content.media.kind}`)
          }}<template v-if="content.music"> · {{ t('catalog.music') }}</template></span
        >
      </div>
      <div class="content-card__body">
        <h3>{{ localize(content.title) }}</h3>
        <p>{{ localize(content.summary) }}</p>
        <div class="content-card__meta">
          <span v-if="content.channel === 'resource' && content.level">{{
            t('catalog.levelValue', { level: content.level })
          }}</span>
          <span v-if="content.channel === 'school'"
            >{{ content.province }} · {{ content.school }}</span
          >
          <span>{{ t('catalog.views', { count: content.views }) }}</span>
          <time :datetime="content.publishedAt">{{ content.publishedAt.slice(0, 10) }}</time>
        </div>
        <span v-if="external" class="content-card__external">{{ t('catalog.external') }} ↗</span>
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
