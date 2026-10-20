<script setup lang="ts">
import type { InteractionKind, WebContentCard } from '@isport/shared'
import ActivityRow from './ActivityRow.vue'

const props = defineProps<{
  items: WebContentCard[]
  kind: InteractionKind
  channel: 'resource' | 'research' | 'school' | ''
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
    <ActivityRow
      v-for="item in items"
      :key="item.contentKey"
      :content="item"
      :kind="kind"
      :disabled="Boolean(removing)"
      :pending="removing === item.contentKey"
      @remove="emit('remove', $event)"
    />
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

<style lang="scss" scoped>
.activity-list {
  display: grid;
  margin-top: 8px;

  &__empty {
    display: grid;
    gap: 12px;
    justify-items: center;
    padding: 48px 12px;
    min-height: 240px;
    background: var(--ic-color-background-container, #fff);
    color: var(--ic-color-text-secondary, #64748b);
    text-align: center;

    p {
      margin: 0;
    }

    a {
      font-weight: var(--ic-font-weight-medium, 500);
      color: var(--ic-color-brand-500, #2563eb);
    }
  }
}
</style>
