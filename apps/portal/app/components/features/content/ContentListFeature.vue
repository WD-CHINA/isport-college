<script setup lang="ts">
import AppPagination from '~/components/app/AppPagination.vue'
import ContentFilters from '~/components/features/content/ContentFilters.vue'
import ContentGrid from '~/components/features/content/ContentGrid.vue'
import { useContentList } from '~/composables/content/useContentList'
import type { ContentChannel } from '@isport/shared'

const props = defineProps<{ channel: ContentChannel }>()
const { t } = useI18n()
const { query, request, filterRequest, categories, update, changePage, retry } = useContentList(
  props.channel,
)
const { data, status, error } = request
const { data: resourceFilters, error: filterError } = filterRequest
const title = computed(() => t(`catalog.channels.${props.channel}`))
useSeoMeta({ title: () => title.value, description: () => t('catalog.description') })
await request
</script>

<template>
  <div class="container-page content-list-feature">
    <header>
      <h1>{{ title }}</h1>
      <p>{{ t('catalog.description') }}</p>
    </header>
    <ContentFilters
      :model-value="query"
      :channel="channel"
      :categories="categories"
      :resource-filters="resourceFilters"
      @update:model-value="update"
    />
    <AAlert v-if="filterError" type="warning" show-icon :title="t('academy.requestFailed')" />
    <AAlert v-if="error" type="error" show-icon :title="t('academy.requestFailed')">
      <template #action
        ><AButton @click="retry">{{ t('catalog.retry') }}</AButton></template
      >
    </AAlert>
    <template v-else>
      <p class="content-list-feature__count" role="status">
        {{
          status === 'pending'
            ? t('common.loading')
            : t('catalog.total', { count: data?.total ?? 0 })
        }}
      </p>
      <ContentGrid :items="data?.list ?? []" :loading="status === 'pending'" />
      <AppPagination
        v-if="data"
        :total="data.total"
        :page="query.page"
        :page-size="data.pageSize"
        @change="changePage"
      />
    </template>
  </div>
</template>

<style scoped>
.content-list-feature {
  display: grid;
  gap: 24px;
  padding-top: 40px;
  padding-bottom: 64px;
}

.content-list-feature h1 {
  margin: 0 0 12px;
  font-size: var(--ic-font-size-3xl, 30px);
  letter-spacing: -0.01em;
}

.content-list-feature header p {
  margin: 0;
  color: var(--ic-color-text-secondary, #64748b);
}

.content-list-feature__count {
  justify-self: start;
  margin: 0;
  padding: 6px 14px;
  border-radius: var(--ic-border-radius-full, 9999px);
  background: var(--ic-color-brand-50, #eff6ff);
  color: var(--ic-color-brand-700, #1e40af);
  font-size: var(--ic-font-size-sm, 14px);
  font-weight: var(--ic-font-weight-medium, 500);
}
</style>
