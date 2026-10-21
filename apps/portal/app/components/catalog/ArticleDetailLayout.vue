<script setup lang="ts">
import { RichTextContent } from '@isport/rich-text'
import type { WebContentCard } from '@isport/shared'
import ContentRecommendation from '~/components/content/ContentRecommendation.vue'
import ContentGrid from '~/components/content/ContentGrid.vue'

const props = withDefaults(
  defineProps<{
    content: { title: string; summary: string; description?: string; htmlBody: string }
    channel: 'resource' | 'research' | 'school' | 'news'
    recommendations?: WebContentCard[]
  }>(),
  { recommendations: () => [] },
)
const { t } = useI18n()
const localePath = useLocalePath()
const channels = {
  resource: '/resources',
  research: '/research',
  school: '/schools',
  news: '/news',
}
const channelTitle = computed(() =>
  props.channel === 'news' ? t('academy.news') : t(`catalog.channels.${props.channel}`),
)
const recommendationsTitle = computed(() =>
  props.channel === 'school' ? t('detail.moreCases') : t('detail.recommendations'),
)
</script>

<template>
  <div class="article-detail" :class="{ 'article-detail--case': channel === 'school' }">
    <nav class="article-detail__breadcrumb" :aria-label="t('detail.breadcrumb')">
      <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
      <span aria-hidden="true">›</span>
      <NuxtLink :to="localePath(channels[channel])">{{ channelTitle }}</NuxtLink>
      <span aria-hidden="true">›</span>
      <span aria-current="page">{{
        t(channel === 'school' ? 'detail.caseDetail' : 'detail.articleDetail')
      }}</span>
    </nav>
    <div class="article-detail__layout">
      <article class="article-detail__reading">
        <header class="article-detail__heading">
          <h1>{{ content.title }}</h1>
          <p v-if="content.summary || content.description" class="article-detail__summary">
            {{ content.summary || content.description }}
          </p>
        </header>
        <slot name="interactions" />
        <RichTextContent class="article-detail__body" :content="content.htmlBody" />
      </article>
      <aside
        v-if="channel !== 'school' && recommendations.length"
        class="article-detail__recommendations"
        :aria-label="recommendationsTitle"
      >
        <h2>{{ recommendationsTitle }}</h2>
        <ContentRecommendation
          v-for="item in recommendations"
          :key="item.contentKey"
          :content="item"
        />
        <NuxtLink class="article-detail__more" :to="localePath(channels[channel])">
          {{ t('common.viewMore') }} →
        </NuxtLink>
      </aside>
    </div>
    <section
      v-if="channel === 'school' && recommendations.length"
      class="article-detail__related"
      :aria-label="t('detail.popularCases')"
    >
      <h2>{{ t('detail.popularCases') }}</h2>
      <ContentGrid :items="recommendations" variant="catalog" channel="school" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.article-detail {
  --catalog-border: var(--ic-color-academy-border-base);

  padding: var(--ic-spacing-10) 0 var(--ic-spacing-16);
  background: var(--ic-color-academy-article-background);

  &__breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    width: min(100% - 48px, 1200px);
    margin: 0 auto var(--ic-spacing-7);
    color: var(--ic-color-academy-text-caption);
    font-size: 14px;
    line-height: 21px;

    a {
      color: inherit;
    }

    [aria-current] {
      color: var(--ic-color-academy-text-primary);
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    align-items: start;
    gap: var(--ic-spacing-8);
    width: min(100% - 48px, 1224px);
    margin-inline: auto;
  }

  &__reading {
    display: grid;
    min-width: 0;
    gap: var(--ic-spacing-6);
    padding: 36px 40px 40px;
    border-radius: var(--ic-border-radius-lg);
    background: var(--ic-color-background-container);
  }

  &__heading {
    display: grid;
    gap: var(--ic-spacing-3);

    h1 {
      margin: 0;
      color: var(--ic-color-academy-article-title);
      font-size: 28px;
      font-weight: 700;
      line-height: 44px;
      overflow-wrap: anywhere;
    }
  }

  &__summary {
    margin: 0;
    color: var(--ic-color-academy-article-summary);
    font-size: 14px;
    line-height: 24px;
    overflow-wrap: anywhere;
  }

  &__body {
    min-width: 0;
    color: var(--ic-color-academy-article-body);
    font-size: 17px;
    line-height: 32px;
    overflow-wrap: anywhere;

    :deep(> *) {
      margin-block: 0;
    }

    :deep(> * + *) {
      margin-top: var(--ic-spacing-5);
    }

    :deep(h2),
    :deep(h3) {
      font-size: 20px;
      font-weight: 700;
      line-height: 32px;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }

    :deep(p:has(> img:nth-of-type(2)):not(:has(> :not(img, br)))) {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
      gap: var(--ic-spacing-3);

      img {
        width: 100%;
      }

      br {
        display: none;
      }
    }

    :deep(pre) {
      max-width: 100%;
      overflow-x: auto;
      white-space: pre-wrap;
    }
  }

  &__recommendations {
    display: grid;
    gap: var(--ic-spacing-6);
    padding-top: var(--ic-spacing-7);

    h2 {
      margin: 0;
      color: var(--ic-color-academy-article-aside-heading);
      font-size: 18px;
      font-weight: 700;
      line-height: 28px;
    }
  }

  &__more {
    width: fit-content;
    color: var(--ic-color-academy-primary);
    font-size: 14px;
    line-height: 24px;
  }

  &--case .article-detail__layout {
    width: min(100% - 48px, 1200px);
    grid-template-columns: minmax(0, 1fr);
  }

  &--case .article-detail__body :deep(p:has(> img:nth-of-type(2)):not(:has(> :not(img, br)))) {
    gap: 20px;
  }

  &__related {
    width: min(100% - 48px, 1200px);
    margin: 48px auto 0;

    h2 {
      margin: 0;
      color: var(--ic-color-academy-text-primary);
      font-size: 24px;
      font-weight: 600;
      line-height: 36px;
    }
  }
}

@media (max-width: 1023px) {
  .article-detail {
    &__layout {
      grid-template-columns: minmax(0, 1fr);
    }

    &__recommendations {
      padding-top: 0;
    }
  }
}

@media (max-width: 767px) {
  .article-detail {
    padding-block: var(--ic-spacing-6) var(--ic-spacing-10);

    &__breadcrumb,
    &__layout,
    &--case .article-detail__layout,
    &__related {
      width: calc(100% - 32px);
    }

    &__breadcrumb {
      gap: 8px 12px;
      margin-bottom: var(--ic-spacing-5);
      font-size: 13px;
    }

    &__reading {
      gap: var(--ic-spacing-5);
      padding: var(--ic-spacing-6) var(--ic-spacing-5);
    }

    &__heading h1 {
      font-size: 24px;
      line-height: 36px;
    }

    &__body {
      font-size: 16px;
      line-height: 30px;

      :deep(p:has(> img:nth-of-type(2)):not(:has(> :not(img, br)))) {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  }
}
</style>
