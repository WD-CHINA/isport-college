<script setup lang="ts">
import type { ContentChannel, WebContentCard, WebContentDetail } from '@isport/shared'
import { useContentLevelLabel } from '~/composables/useContentLevelLabel'
//import { ACADEMY_CAPABILITIES } from '~/config/capabilities'
import ContentGrid from '~/components/content/ContentGrid.vue'

const props = defineProps<{
  content: WebContentDetail
  channel: ContentChannel
  recommendations: WebContentCard[]
}>()
const { t } = useI18n()
const localePath = useLocalePath()
const getLevelLabel = useContentLevelLabel()
const channelPath = computed(
  () => ({ resource: '/resources', research: '/research', school: '/schools' })[props.channel],
)
const level = computed(() => getLevelLabel(props.content))
const publisher = computed(
  () =>
    props.content.publisherName ||
    props.content.authorName ||
    t(props.content.origin === 'PLATFORM' ? 'detail.platformUpload' : 'detail.academySource'),
)
</script>

<template>
  <div class="resource-detail">
    <div class="resource-detail__inner">
      <nav class="resource-detail__breadcrumb" :aria-label="t('detail.breadcrumb')">
        <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
        <span aria-hidden="true">›</span>
        <NuxtLink :to="localePath(channelPath)">{{ t(`catalog.channels.${channel}`) }}</NuxtLink>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{{ t('detail.resourceDetail') }}</span>
      </nav>
      <div class="resource-detail__hero">
        <div class="resource-detail__preview"><slot name="preview" /></div>
        <article class="resource-detail__information">
          <h1>{{ content.title }}</h1>
          <div v-if="content.categoryName || level" class="resource-detail__tags">
            <span v-if="content.categoryName">{{ content.categoryName }}</span>
            <span v-if="level">{{ level }}</span>
          </div>
          <div class="resource-detail__publisher">
            <span class="resource-detail__publisher-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 21V5l10-3v19M14 9h6v12M2 21h20M7 7h3M7 11h3M7 15h3M7 19h3M17 12h1M17 16h1"
                />
              </svg>
            </span>
            <div>
              <strong>{{ publisher }}</strong>
              <p>{{ content.schoolName || t('detail.fromAcademy') }}</p>
            </div>
          </div>
          <p v-if="content.summary || content.description" class="resource-detail__summary">
            {{ content.summary || content.description }}
          </p>
          <div v-if="$slots.interactions" class="resource-detail__actions">
            <slot name="interactions" />
            <!--<button
              v-if="!ACADEMY_CAPABILITIES.contentReport.enabled"
              class="resource-detail__report"
              type="button"
              disabled
              :title="t('detail.reportUnavailable')"
            >
              {{ t('detail.report') }}
            </button>-->
          </div>
        </article>
      </div>
      <section v-if="recommendations.length" class="resource-detail__recommendations">
        <h2>{{ t('detail.recommendedResources') }}</h2>
        <ContentGrid
          :items="recommendations"
          variant="resource-recommendation"
          :channel="channel"
        />
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.resource-detail {
  padding: var(--ic-spacing-10) 0 60px;
  background: var(--ic-color-academy-background-page);
  color: var(--ic-color-academy-text-primary);

  &__inner {
    width: min(100% - 48px, 1200px);
    margin-inline: auto;
  }

  &__breadcrumb {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin-bottom: var(--ic-spacing-7);
    color: var(--ic-color-academy-text-caption);
    font-size: 14px;
    line-height: 21px;

    a {
      color: inherit;
    }

    a:hover {
      color: var(--ic-color-academy-primary);
    }

    [aria-current] {
      color: var(--ic-color-academy-text-primary);
    }
  }

  &__hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 376px;
    align-items: start;
    gap: var(--ic-spacing-6);
  }

  &__preview {
    min-width: 0;

    :deep(.preview-frame) {
      border: 0;
      border-radius: var(--ic-border-radius-lg);
      background: var(--ic-color-background-container);
      box-shadow: inset 0 0 0 1px var(--ic-color-academy-border-panel);
    }

    :deep(.preview-frame__toolbar) {
      display: none;
    }

    :deep(.preview-frame__content) {
      display: grid;
      min-height: 450px;
      align-items: center;
      padding: 0;
    }

    :deep(.document-preview__frame) {
      height: 450px;
      min-height: 450px;
    }
  }

  &__information {
    display: flex;
    min-width: 0;
    min-height: 450px;
    flex-direction: column;
    padding: 32px 28px 8px;
    border-radius: var(--ic-border-radius-lg);
    background: var(--ic-color-background-container);
    box-shadow: inset 0 0 0 1px var(--ic-color-academy-border-panel);

    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
      line-height: 42px;
      overflow-wrap: anywhere;
    }
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ic-spacing-2);
    margin-top: 18px;

    span {
      padding: 4px 12px;
      border-radius: var(--ic-border-radius-sm);
      background: var(--ic-color-academy-tint);
      color: var(--ic-color-academy-primary);
      font-size: 13px;
      line-height: 20px;
    }
  }

  &__publisher {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-top: var(--ic-spacing-7);
    padding-top: var(--ic-spacing-6);
    border-top: 1px solid var(--ic-color-academy-border-panel);

    strong {
      font-size: 16px;
      font-weight: 600;
      line-height: 24px;
      overflow-wrap: anywhere;
    }

    p {
      margin: 4px 0 0;
      color: var(--ic-color-academy-text-caption);
      font-size: 13px;
      line-height: 20px;
      overflow-wrap: anywhere;
    }
  }

  &__publisher-icon {
    display: grid;
    width: 44px;
    height: 44px;
    flex: none;
    place-items: center;
    border-radius: var(--ic-border-radius-full);
    background: var(--ic-color-academy-tint);
    color: var(--ic-color-academy-primary);

    svg {
      width: 24px;
      height: 24px;
      stroke: currentcolor;
      stroke-width: 1.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  &__summary {
    margin: 20px 0 24px;
    color: var(--ic-color-academy-text-caption);
    font-size: 14px;
    line-height: 24px;
    overflow-wrap: anywhere;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    margin-top: auto;
    border-radius: var(--ic-border-radius-md);
    background: transparent;
  }

  &__report {
    min-height: 44px;
    margin-inline-start: auto;
    padding: 0 24px 0 12px;
    border: 0;
    background: transparent;
    color: var(--ic-color-academy-text-caption);
    font-size: 13px;
    cursor: not-allowed;
  }

  &__recommendations {
    margin-top: 58px;

    h2 {
      margin: 0 0 14px;
      font-size: 24px;
      font-weight: 600;
      line-height: 36px;
    }
  }
}

@media (max-width: 1023px) {
  .resource-detail {
    &__hero {
      grid-template-columns: minmax(0, 1fr);
    }

    &__information {
      min-height: 0;
      padding-bottom: var(--ic-spacing-7);
    }

    &__actions {
      margin-top: var(--ic-spacing-7);
    }
  }
}

@media (max-width: 767px) {
  .resource-detail {
    padding-block: var(--ic-spacing-6) var(--ic-spacing-10);

    &__inner {
      width: calc(100% - 32px);
    }

    &__preview :deep(.preview-frame__content) {
      min-height: 0;
    }

    &__preview :deep(.document-preview__frame) {
      height: 60vh;
      min-height: 320px;
    }

    &__breadcrumb {
      gap: 8px 12px;
      margin-bottom: var(--ic-spacing-5);
      font-size: 13px;
    }

    &__information {
      padding: var(--ic-spacing-6) var(--ic-spacing-5);
    }

    &__information h1 {
      font-size: 24px;
      line-height: 36px;
    }

    &__recommendations {
      margin-top: var(--ic-spacing-8);
    }

    &__recommendations h2 {
      font-size: 22px;
      line-height: 32px;
    }
  }
}
</style>
