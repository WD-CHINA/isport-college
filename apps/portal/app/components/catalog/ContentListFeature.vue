<script setup lang="ts">
import { canonicalUrl } from '~/utils/seo'
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import AppPagination from '~/components/app/AppPagination.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import ContentFilters from './ContentFilters.vue'
import ContentGrid from '~/components/content/ContentGrid.vue'
import CatalogHero from './CatalogHero.vue'
import { useContentList } from '~/composables/catalog/useContentList'
import { contentQueryToUrl, type ContentChannel } from '@isport/shared'

const props = defineProps<{ channel: ContentChannel }>()
const { t } = useI18n()
const { query, request, data, resourceFilters, categories, update, search, changePage, retry } =
  useContentList(props.channel)
const { status, error } = request
const emptySearch = computed(
  () =>
    props.channel === 'resource' &&
    Boolean(query.value.keyword) &&
    status.value === 'success' &&
    data.value?.total === 0,
)
const title = computed(() => t(`catalog.channels.${props.channel}`))
const sectionTitle = computed(() => {
  const category = categories.value.find(item => item.id === query.value.category)?.name
  if (props.channel === 'resource' && category) return t('catalog.resourceSection', { category })
  return (
    category ??
    t(props.channel === 'school' ? 'catalog.allCases' : `catalog.channels.${props.channel}`)
  )
})
const listStart = useTemplateRef<HTMLElement>('listStart')
async function scrollToList() {
  await nextTick()
  if (props.channel === 'resource') listStart.value?.scrollIntoView({ block: 'start' })
}
async function handleSearch(keyword: string) {
  if (await search(keyword)) await scrollToList()
}
async function handlePageChange(page: number) {
  if (!(await changePage(page))) await scrollToList()
}
const route = useRoute()
useSeoMeta({ title: () => title.value, description: () => t(`seo.${props.channel}Desc`) })
useHead(() => {
  const params = contentQueryToUrl(query.value)
  if (props.channel !== 'school' && params.category === categories.value[0]?.id)
    delete params.category
  return { link: [{ key: 'canonical', rel: 'canonical', href: canonicalUrl(route.path, params) }] }
})
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request
</script>

<template>
  <div class="content-list-feature" :class="`content-list-feature--${channel}`">
    <ContextHolder />
    <CatalogHero :channel="channel" :keyword="query.keyword" @search="handleSearch" />
    <div
      ref="listStart"
      class="content-list-feature__main"
      :class="{
        'content-list-feature__main--without-pagination': !data || data.total <= data.pageSize,
      }"
    >
      <ContentFilters
        v-if="!emptySearch"
        :model-value="query"
        :channel="channel"
        :categories="categories"
        :resource-filters="resourceFilters"
        @update:model-value="update"
      />
      <AButton v-if="error" @click="retry">{{ t('catalog.retry') }}</AButton>
      <template v-else>
        <header v-if="!emptySearch" class="content-list-feature__heading">
          <h2>{{ sectionTitle }}</h2>
          <p class="content-list-feature__count" role="status">
            {{
              status === 'pending'
                ? t('common.loading')
                : t(channel === 'resource' ? 'catalog.resourceTotal' : 'catalog.total', {
                    count: data?.total ?? 0,
                  })
            }}
          </p>
          <p v-if="channel !== 'resource'" class="content-list-feature__description">
            {{ t(`catalog.sectionIntro.${channel}`) }}
          </p>
        </header>
        <AppEmpty
          v-if="emptySearch"
          class="content-list-feature__search-empty"
          :description="t('catalog.noSearchResults')"
        />
        <ContentGrid
          v-else
          :items="data?.list ?? []"
          :loading="status === 'pending'"
          variant="catalog"
          :channel="channel"
        />
        <AppPagination
          v-if="data"
          variant="catalog"
          :total="data.total"
          :page="query.page"
          :page-size="data.pageSize"
          @change="handlePageChange"
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
    padding: 32px 0 0;

    &--without-pagination {
      padding-bottom: var(--ic-spacing-6);
    }
  }

  &:not(.content-list-feature--resource) .content-list-feature__main {
    min-width: 0;
    gap: 0;
  }

  &--research .content-list-feature__main {
    padding-top: 26px;
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
  }

  &.content-list-feature--research .content-list-feature__heading {
    gap: 19px;
    padding-top: 30px;

    h2 {
      font-weight: 700;
    }
  }

  &--research :deep(.content-grid) {
    margin-top: 29px;
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

  &__search-empty {
    margin: 0;
    padding-block: var(--ic-spacing-8) var(--ic-spacing-12);
  }

  &__description {
    width: 100%;
    margin: 0;
    color: var(--ic-color-academy-text-caption);
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
