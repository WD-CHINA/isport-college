<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import AppPagination from '~/components/app/AppPagination.vue'
import ContentFilters from './ContentFilters.vue'
import ContentGrid from '~/components/content/ContentGrid.vue'
import CatalogHero from './CatalogHero.vue'
import { useContentList } from '~/composables/catalog/useContentList'
import { contentQueryToUrl, type ContentChannel } from '@isport/shared'

const props = defineProps<{ channel: ContentChannel }>()
const { t } = useI18n()
const { query, request, filterRequest, categories, update, search, changePage, retry } =
  useContentList(props.channel)
const { data, status, error } = request
const { data: resourceFilters, error: filterError } = filterRequest
const title = computed(() => t(`catalog.channels.${props.channel}`))
const sectionTitle = computed(
  () =>
    categories.value.find(item => item.id === query.value.category)?.name ??
    t(props.channel === 'school' ? 'catalog.allCases' : `catalog.channels.${props.channel}`),
)
const listStart = useTemplateRef<HTMLElement>('listStart')
watch(
  () => JSON.stringify(contentQueryToUrl(query.value)),
  async () => {
    await nextTick()
    if (props.channel === 'resource') listStart.value?.scrollIntoView({ block: 'start' })
  },
)
useSeoMeta({ title: () => title.value, description: () => t('catalog.description') })
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, filterError, () => t('academy.requestFailed'), 'warning')
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request
</script>

<template>
  <div class="content-list-feature" :class="`content-list-feature--${channel}`">
    <ContextHolder />
    <CatalogHero :channel="channel" :keyword="query.keyword" @search="search" />
    <div ref="listStart" class="content-list-feature__main">
      <ContentFilters
        :model-value="query"
        :channel="channel"
        :categories="categories"
        :resource-filters="resourceFilters"
        @update:model-value="update"
      />
      <AButton v-if="error" @click="retry">{{ t('catalog.retry') }}</AButton>
      <template v-else>
        <header class="content-list-feature__heading">
          <h2>{{ sectionTitle }}</h2>
          <p class="content-list-feature__count" role="status">
            {{
              status === 'pending'
                ? t('common.loading')
                : t('catalog.total', { count: data?.total ?? 0 })
            }}
          </p>
          <p v-if="channel !== 'resource'" class="content-list-feature__description">
            {{ t(`catalog.sectionIntro.${channel}`) }}
          </p>
        </header>
        <ContentGrid
          :items="data?.list ?? []"
          :loading="status === 'pending'"
          variant="catalog"
          :channel="channel"
        />
        <AppPagination
          v-if="data"
          :total="data.total"
          :page="query.page"
          :page-size="data.pageSize"
          @change="changePage"
        />
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-list-feature {
  --catalog-primary: var(--ic-color-academy-primary);
  --catalog-text: var(--ic-color-academy-text-primary);
  --catalog-muted: var(--ic-color-academy-text-muted);
  --catalog-border: var(--ic-color-academy-border-base);

  background: var(--ic-color-academy-background-page);
  color: var(--catalog-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

  &__main {
    display: grid;
    width: min(100% - 48px, 1200px);
    gap: 24px;
    margin-inline: auto;
    padding: 32px 0 50px;
  }

  &:not(.content-list-feature--resource) .content-list-feature__main {
    min-width: 0;
    gap: 0;
  }

  &--resource .content-list-feature__main {
    gap: 18px;
    padding-top: 26px;
  }

  &__heading {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 14px;
    padding-top: 8px;
  }

  &--resource .content-list-feature__heading {
    padding-top: 30px;
  }

  &:not(.content-list-feature--resource) .content-list-feature__heading {
    display: grid;
    gap: 12px;
    padding-top: 32px;
    padding-right: 64px;
  }

  &:not(.content-list-feature--resource) .content-list-feature__count {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  &:not(.content-list-feature--resource) .content-list-feature__description {
    line-height: 16px;
  }

  &__heading {
    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      line-height: 24px;
    }
  }

  &__count {
    margin: 0;
    color: var(--catalog-muted);
    font-size: 12px;
  }

  &__description {
    width: 100%;
    margin: 0;
    color: var(--catalog-muted);
    font-size: 13px;
    line-height: 20px;
  }
}

@media (max-width: 767px) {
  .content-list-feature {
    &__main {
      width: calc(100% - 32px);
      padding-top: 24px;
    }
  }
}
</style>
