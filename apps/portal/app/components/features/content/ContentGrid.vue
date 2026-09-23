<script setup lang="ts">
import type { AcademyContent } from '@isport/shared'
import { Empty as AEmpty, Skeleton as ASkeleton } from 'antdv-next'

defineProps<{ items: AcademyContent[]; loading?: boolean }>()
const { t } = useI18n()
</script>

<template>
  <div :aria-busy="loading" class="content-grid">
    <template v-if="loading"><ASkeleton v-for="index in 4" :key="index" active /></template>
    <ContentCard v-for="item in loading ? [] : items" :key="item.id" :content="item" />
  </div>
  <AEmpty v-if="!loading && !items.length" :description="t('catalog.noResults')" />
</template>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 245px), 1fr));
  gap: 24px;
}
</style>
