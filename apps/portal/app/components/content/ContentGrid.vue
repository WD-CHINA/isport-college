<script setup lang="ts">
import ContentCard from './ContentCard.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import type { ContentChannel, WebContentCard } from '@isport/shared'

defineProps<{
  items: WebContentCard[]
  loading?: boolean
  variant?: 'default' | 'catalog'
  channel?: ContentChannel
}>()
const { t } = useI18n()
</script>

<template>
  <div
    :aria-busy="loading"
    class="content-grid"
    :class="{
      'content-grid--wide': variant === 'catalog' && channel !== 'resource',
      'content-grid--catalog': variant === 'catalog',
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
  <AppEmpty v-if="!loading && !items.length" :description="t('catalog.noResults')" />
</template>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 245px), 1fr));
  gap: 24px;
}

.content-grid--catalog {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.content-grid--wide {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 1023px) {
  .content-grid--catalog {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .content-grid--catalog {
    grid-template-columns: 1fr;
  }
}
</style>
