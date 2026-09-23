<script setup lang="ts">
import type { ActivityItem, InteractionKind, ContentChannel } from '@isport/shared'
import { Button as AButton, Skeleton as ASkeleton } from 'antdv-next'
import ContentCard from '../content/ContentCard.vue'

const props = defineProps<{
  items: ActivityItem[]
  kind: InteractionKind
  channel: ContentChannel | ''
  loading: boolean
  removing: string
}>()
const emit = defineEmits<{ remove: [id: string] }>()
const { t } = useI18n()
const localePath = useLocalePath()
const browsePath = computed(() =>
  props.channel === 'research'
    ? '/research'
    : props.channel === 'school'
      ? '/schools'
      : '/resources',
)
</script>

<template>
  <ASkeleton v-if="loading" active />
  <div v-else-if="items.length" class="activity-list">
    <ContentCard v-for="item in items" :key="item.content.id" :content="item.content">
      <div class="activity-list__action">
        <time :datetime="item.createdAt"
          >{{ t('account.relationTime') }}：{{
            item.createdAt.slice(0, 19).replace('T', ' ')
          }}</time
        >
        <AButton
          :disabled="Boolean(removing)"
          :loading="removing === item.content.id"
          @click="emit('remove', item.content.id)"
          >{{ t(kind === 'favorite' ? 'detail.unfavorite' : 'detail.unlike') }}</AButton
        >
      </div>
    </ContentCard>
  </div>
  <div v-else class="activity-list__empty">
    <p>
      {{
        t('account.empty', { kind: t(kind === 'favorite' ? 'account.favorites' : 'account.likes') })
      }}
    </p>
    <NuxtLink :to="localePath(browsePath)">{{ t('account.browse') }}</NuxtLink>
  </div>
</template>

<style scoped>
.activity-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 245px), 1fr));
  gap: 20px;
}

.activity-list__action {
  display: grid;
  gap: 12px;
  padding: 0 18px 18px;
  font-size: var(--ic-font-size-xs, 12px);
  color: var(--ic-color-text-secondary, #64748b);
}

.activity-list__empty {
  display: grid;
  gap: 12px;
  justify-items: center;
  padding: 48px 12px;
  border: 1px dashed var(--ic-color-border-strong, #cbd5e1);
  border-radius: var(--ic-border-radius-lg, 12px);
  background: var(--ic-color-background-container, #fff);
  color: var(--ic-color-text-secondary, #64748b);
  text-align: center;
}

.activity-list__empty p {
  margin: 0;
}

.activity-list__empty a {
  font-weight: var(--ic-font-weight-medium, 500);
  color: var(--ic-color-brand-500, #2563eb);
}
</style>
