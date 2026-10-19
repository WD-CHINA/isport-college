<script setup lang="ts">
import ContentCard from './ContentCard.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import type { ContentChannel, WebContentCard } from '@isport/shared'

defineProps<{
  items: WebContentCard[]
  loading?: boolean
  variant?: 'default' | 'catalog' | 'resource-recommendation'
  channel?: ContentChannel
}>()
const { t } = useI18n()
</script>

<template>
  <div
    :aria-busy="loading"
    class="content-grid"
    :class="{
      'content-grid--wide': variant === 'catalog' && channel === 'research',
      'content-grid--school': variant === 'catalog' && channel === 'school',
      'content-grid--catalog': variant === 'catalog',
      'content-grid--recommendations': variant === 'resource-recommendation',
    }"
  >
    <template v-if="loading"><ASkeleton v-for="index in 4" :key="index" active /></template>
    <ContentCard
      v-for="item in loading ? [] : items"
      :key="item.contentKey"
      :content="item"
      :variant="variant"
    />
  </div>
  <AppEmpty
    v-if="!loading && !items.length"
    :class="{ 'content-grid__empty--catalog': variant === 'catalog' }"
    :description="t('catalog.noResults')"
  />
</template>

<style lang="scss" scoped>
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 245px), 1fr));
  gap: 24px;

  &--catalog {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  &--wide {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px;
  }

  &--school {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &--recommendations {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &--wide,
  &--school {
    margin-top: var(--ic-spacing-6);
    row-gap: var(--ic-spacing-6);
  }

  &__empty--catalog {
    margin: 0;
    padding-block: var(--ic-spacing-8) var(--ic-spacing-12);
  }
}

@media (max-width: 1023px) {
  .content-grid {
    &--catalog,
    &--recommendations {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}

@media (max-width: 767px) {
  .content-grid {
    &__empty--catalog {
      padding-block: var(--ic-spacing-6) var(--ic-spacing-10);
    }

    &--catalog,
    &--recommendations {
      grid-template-columns: 1fr;
    }
  }
}
</style>
