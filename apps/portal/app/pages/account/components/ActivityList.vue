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
    <div class="activity-list__empty-content">
      <img class="activity-list__empty-image" src="/account/empty-activity.svg" alt="" />
      <h2>
        {{ t(kind === 'favorite' ? 'account.emptyFavoriteTitle' : 'account.emptyLikeTitle') }}
      </h2>
      <p>
        {{
          t(
            kind === 'favorite'
              ? 'account.emptyFavoriteDescription'
              : 'account.emptyLikeDescription',
          )
        }}
      </p>
      <NuxtLink :to="localePath(browsePath)">
        {{ t('account.browse') }} <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.activity-list {
  display: grid;
  margin-top: 8px;

  &__empty {
    display: grid;
    min-height: 400px;
    place-items: center;
    text-align: center;

    h2 {
      margin: 0;
      color: var(--ic-color-academy-text-primary);
      font-size: 20px;
      font-weight: 600;
      line-height: 30px;
    }

    p {
      margin: 0;
      color: #697586;
      font-size: 14px;
      line-height: 21px;
    }

    a {
      display: inline-flex;
      width: 152px;
      min-height: 40px;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      border-radius: 6px;
      background: var(--ic-color-academy-primary);
      color: var(--ic-color-text-inverse);
      font-size: 14px;
      font-weight: 500;
      line-height: 21px;

      &:focus-visible {
        outline: 2px solid var(--ic-color-academy-primary);
        outline-offset: 3px;
      }
    }
  }

  &__empty-content {
    display: flex;
    max-width: 100%;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    padding: 24px 0;
  }

  &__empty-image {
    display: block;
    width: 96px;
    height: 96px;
  }
}
</style>
