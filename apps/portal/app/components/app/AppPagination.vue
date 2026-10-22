<script setup lang="ts">
import { useBreakpoint, type PaginationProps } from 'antdv-next'
import { h } from 'vue'
import AppPaginationJumpIcon from './AppPaginationJumpIcon.vue'

withDefaults(
  defineProps<{
    total: number
    pageSize: number
    page: number
    variant?: 'default' | 'catalog'
    hideOnSinglePage?: boolean
  }>(),
  { variant: 'default', hideOnSinglePage: true },
)
const emit = defineEmits<{ change: [page: number] }>()
const screens = useBreakpoint()
// itemRender 每次渲染都创建图标，避免 jumpIcon 插槽缓存已挂载或已水合的 VNode。
const renderItem: NonNullable<PaginationProps['itemRender']> = (_page, type, element) => {
  if (type === 'jump-prev' || type === 'jump-next') {
    return h(AppPaginationJumpIcon, { direction: type === 'jump-prev' ? 'prev' : 'next' })
  }
  return element
}
</script>

<template>
  <div
    v-if="total > 0 && (!hideOnSinglePage || total > pageSize)"
    class="app-pagination"
    :class="{ 'app-pagination--catalog': variant === 'catalog' }"
  >
    <APagination
      :current="page"
      :total="total"
      :page-size="pageSize"
      :show-size-changer="false"
      :show-less-items="variant === 'catalog' && !screens?.sm"
      :hide-on-single-page="hideOnSinglePage"
      :item-render="renderItem"
      responsive
      @change="value => emit('change', value)"
    >
      <template v-if="variant === 'catalog'" #prevIcon>
        <button class="ant-pagination-item-link" type="button" tabindex="-1">
          <svg class="app-pagination__arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m12 4-6 6 6 6" />
          </svg>
        </button>
      </template>
      <template v-if="variant === 'catalog'" #nextIcon>
        <button class="ant-pagination-item-link" type="button" tabindex="-1">
          <svg class="app-pagination__arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m8 4 6 6-6 6" />
          </svg>
        </button>
      </template>
    </APagination>
  </div>
</template>

<style lang="scss" scoped>
.app-pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 28px;

  &--catalog {
    align-items: center;
    margin: 0;
    padding: var(--ic-spacing-6) var(--ic-spacing-1);
    color: var(--ic-color-academy-text-primary);
    font-size: 14px;

    :deep(.ant-pagination) {
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--ic-spacing-2);
      margin: 0;
      color: inherit;
    }

    :deep(.ant-pagination::after) {
      display: none;
    }

    :deep(.ant-pagination-item),
    :deep(.ant-pagination-prev),
    :deep(.ant-pagination-next),
    :deep(.ant-pagination-jump-prev),
    :deep(.ant-pagination-jump-next) {
      min-width: var(--ic-spacing-8);
      height: var(--ic-spacing-8);
      flex: 0 0 var(--ic-spacing-8);
      margin: 0;
      border: 0;
      border-radius: 3px;
      background: transparent;
      line-height: var(--ic-spacing-8);
    }

    :deep(.ant-pagination-item a) {
      padding: 0;
      color: inherit;
    }

    :deep(.ant-pagination-item-active),
    :deep(.ant-pagination-item-active:hover) {
      background: var(--ic-color-academy-tint);
      color: var(--ic-color-academy-primary);
    }

    :deep(.ant-pagination-prev .ant-pagination-item-link),
    :deep(.ant-pagination-next .ant-pagination-item-link) {
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 3px;
      background: transparent;
      color: var(--ic-color-academy-text-primary);
    }

    :deep(.ant-pagination-prev:not(.ant-pagination-disabled):hover .ant-pagination-item-link),
    :deep(.ant-pagination-next:not(.ant-pagination-disabled):hover .ant-pagination-item-link) {
      background: transparent;
      color: var(--ic-color-academy-text-primary);
    }

    :deep(.ant-pagination-disabled .ant-pagination-item-link) {
      color: var(--ic-color-academy-text-disabled);
    }

    :deep(.ant-pagination .ant-pagination-item-container .ant-pagination-item-ellipsis) {
      color: var(--ic-color-academy-text-primary);
    }

    :deep(.ant-pagination-item-link-icon) {
      color: var(--ic-color-academy-primary);
    }

    :deep(.ant-pagination-item:focus-visible),
    :deep(.ant-pagination-jump-prev:focus-visible),
    :deep(.ant-pagination-jump-next:focus-visible),
    :deep(.ant-pagination-prev:focus-visible .ant-pagination-item-link),
    :deep(.ant-pagination-next:focus-visible .ant-pagination-item-link) {
      outline: 2px solid var(--ic-color-academy-primary);
      outline-offset: 2px;
    }
  }

  &__arrow {
    width: 20px;
    height: 20px;
    stroke: currentcolor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.5;
  }
}
</style>
