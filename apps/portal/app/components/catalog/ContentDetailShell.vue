<script setup lang="ts">
import { formatPublishedAt, type WebContentDetail } from '@isport/shared'

const props = defineProps<{ content: WebContentDetail }>()
const { t } = useI18n()
const localePath = useLocalePath()
const channels = { RESOURCE: '/resources', RESEARCH: '/research', SCHOOL: '/schools' }
const localChannels = { RESOURCE: 'resource', RESEARCH: 'research', SCHOOL: 'school' } as const
const kinds = {
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'pdf',
  IMAGE: 'image',
  LINK: 'link',
  ARTICLE: 'article',
} as const
const published = computed(() => formatPublishedAt(props.content.publishedAt))
</script>

<template>
  <article class="detail-shell">
    <nav class="detail-shell__breadcrumb" :aria-label="t('detail.breadcrumb')">
      <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink
      ><span>/</span>
      <NuxtLink :to="localePath(channels[content.channel])">{{
        t(`catalog.channels.${localChannels[content.channel]}`)
      }}</NuxtLink
      ><span>/</span>
      <span>{{ content.categoryName }}</span>
    </nav>
    <header>
      <h1 class="detail-shell__title">{{ content.title }}</h1>
      <p class="detail-shell__meta">
        <span v-if="content.authorName">{{ t('detail.author') }}：{{ content.authorName }}</span>
        <time v-if="published" :datetime="published">{{ published }}</time>
        <span>{{ t(`catalog.media.${kinds[content.detailType]}`) }}</span>
        <span v-if="content.schoolName">{{ content.provinceName }} · {{ content.schoolName }}</span>
      </p>
    </header>
    <slot />
    <section class="detail-shell__summary">
      <h2>{{ t('detail.summary') }}</h2>
      <p>{{ content.summary || content.description || t('detail.noSummary') }}</p>
    </section>
    <slot name="interactions" />
  </article>
</template>

<style lang="scss" scoped>
.detail-shell {
  &__breadcrumb,
  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
    color: #64748b;
    font-size: 14px;
  }

  &__title {
    font-size: clamp(24px, 4vw, 36px);
    line-height: 1.4;
    margin: 24px 0 12px;
    overflow-wrap: anywhere;
  }

  &__meta {
    margin-bottom: 24px;
  }

  &__summary {
    margin-top: 24px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }
}
</style>
