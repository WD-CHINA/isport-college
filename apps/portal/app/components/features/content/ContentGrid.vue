<script setup lang="ts">
import ContentCard from '~/components/features/content/ContentCard.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import type { WebContentCard } from '@isport/shared'

defineProps<{ items: WebContentCard[]; loading?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <div :aria-busy="loading" class="content-grid">
    <template v-if="loading"><ASkeleton v-for="index in 4" :key="index" active /></template>
    <ContentCard v-for="item in loading ? [] : items" :key="item.contentKey" :content="item" />
  </div>
  <AppEmpty v-if="!loading && !items.length" :description="t('catalog.noResults')" />
</template>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 245px), 1fr));
  gap: 24px;
}
</style>
