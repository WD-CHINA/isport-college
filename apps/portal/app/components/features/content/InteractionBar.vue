<script setup lang="ts">
import type { ContentStats, InteractionKind } from '@isport/shared'
import { Button as AButton } from 'antdv-next'

defineProps<{ stats: ContentStats; pending: boolean }>()
const emit = defineEmits<{ change: [kind: InteractionKind, active: boolean] }>()
const { t } = useI18n()
</script>

<template>
  <div class="interaction-bar">
    <span data-testid="view-count">{{ t('catalog.views', { count: stats.views }) }}</span>
    <AButton
      :disabled="pending"
      :aria-pressed="stats.liked"
      @click="emit('change', 'like', !stats.liked)"
      >{{ t(stats.liked ? 'detail.unlike' : 'detail.like') }} · {{ stats.likes }}</AButton
    >
    <AButton
      :disabled="pending"
      :aria-pressed="stats.favorited"
      @click="emit('change', 'favorite', !stats.favorited)"
      >{{ t(stats.favorited ? 'detail.unfavorite' : 'detail.favorite') }} ·
      {{ stats.favorites }}</AButton
    >
  </div>
</template>

<style scoped>
.interaction-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 18px 0;
}
</style>
