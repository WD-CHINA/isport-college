<script setup lang="ts">
import type { AcademyContent, LocalizedText } from '@isport/shared'

defineProps<{ content: AcademyContent; categoryLabel: LocalizedText }>()
const { t } = useI18n()
const localize = useLocalizedText()
const localePath = useLocalePath()
const channels = { resource: '/resources', research: '/research', school: '/schools' }
</script>

<template>
  <article class="detail-shell">
    <nav class="detail-shell__breadcrumb" :aria-label="t('detail.breadcrumb')">
      <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink
      ><span>/</span>
      <NuxtLink :to="localePath(channels[content.channel])">{{
        t(`catalog.channels.${content.channel}`)
      }}</NuxtLink
      ><span>/</span>
      <span>{{ localize(categoryLabel) }}</span>
    </nav>
    <header>
      <h1 class="detail-shell__title">{{ localize(content.title) }}</h1>
      <p class="detail-shell__meta">
        <span>{{ t('detail.author') }}：{{ content.author }}</span>
        <time :datetime="content.publishedAt">{{ content.publishedAt.slice(0, 10) }}</time>
        <span>{{ t(`catalog.media.${content.media.kind}`) }}</span>
        <span v-if="content.level">{{ t('catalog.levelValue', { level: content.level }) }}</span>
        <span v-if="content.school">{{ content.province }} · {{ content.school }}</span>
      </p>
    </header>
    <slot />
    <section class="detail-shell__summary">
      <h2>{{ t('detail.summary') }}</h2>
      <p>{{ localize(content.summary) || t('detail.noSummary') }}</p>
    </section>
    <slot name="interactions" />
  </article>
</template>

<style scoped>
.detail-shell__breadcrumb,
.detail-shell__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  color: #64748b;
  font-size: 14px;
}

.detail-shell__title {
  font-size: clamp(24px, 4vw, 36px);
  line-height: 1.4;
  margin: 24px 0 12px;
  overflow-wrap: anywhere;
}

.detail-shell__meta {
  margin-bottom: 24px;
}

.detail-shell__summary {
  margin-top: 24px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}
</style>
