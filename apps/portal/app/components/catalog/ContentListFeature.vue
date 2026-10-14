<script setup lang="ts">
import AppPagination from '~/components/app/AppPagination.vue'
import ContentFilters from './ContentFilters.vue'
import ContentGrid from '~/components/content/ContentGrid.vue'
import CatalogHero from './CatalogHero.vue'
import ResourcePreviewDialog from './ResourcePreviewDialog.vue'
import { useContentList } from '~/composables/catalog/useContentList'
import { contentQueryToUrl, type ContentChannel, type WebContentCard } from '@isport/shared'

const props = defineProps<{ channel: ContentChannel }>()
const route = useRoute()
const { t } = useI18n()
const { query, request, filterRequest, categories, update, search, recordView, changePage, retry } =
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
const preview = shallowRef<WebContentCard | null>(null)
const previewOpen = shallowRef(false)
function openPreview(content: WebContentCard) {
  preview.value = content
  previewOpen.value = true
}
function closePreview() {
  if (!previewOpen.value) preview.value = null
}
function viewed(contentKey: string, count: number) {
  if (previewOpen.value && preview.value?.contentKey === contentKey) recordView(contentKey, count)
}
watch(
  () => JSON.stringify(contentQueryToUrl(query.value)),
  async () => {
    previewOpen.value = false
    await nextTick()
    if (props.channel === 'resource') listStart.value?.scrollIntoView({ block: 'start' })
  },
)
watch(
  () => route.path,
  () => {
    previewOpen.value = false
  },
)
useSeoMeta({ title: () => title.value, description: () => t('catalog.description') })
await request
</script>

<template>
  <div class="content-list-feature" :class="`content-list-feature--${channel}`">
    <CatalogHero :channel="channel" :keyword="query.keyword" @search="search" />
    <div ref="listStart" class="content-list-feature__main">
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
          :preview-resources="channel === 'resource'"
          @preview="openPreview"
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
    <ResourcePreviewDialog
      v-if="preview"
      :key="preview.contentKey"
      v-model:open="previewOpen"
      :content="preview"
      @viewed="viewed"
      @closed="closePreview"
    />
  </div>
</template>

<style scoped>
.content-list-feature {
  --catalog-primary: #0077fa;
  --catalog-text: #1c1f23;
  --catalog-muted: #68788c;
  --catalog-border: rgb(28 31 35 / 10%);

  background: #fbfdff;
  color: var(--catalog-text);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.content-list-feature__main {
  display: grid;
  width: min(100% - 48px, 1200px);
  gap: 24px;
  margin-inline: auto;
  padding: 32px 0 50px;
}

.content-list-feature--resource .content-list-feature__main {
  gap: 18px;
  padding-top: 26px;
}

.content-list-feature__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 14px;
  padding-top: 8px;
}

.content-list-feature--resource .content-list-feature__heading {
  padding-top: 30px;
}

.content-list-feature__heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  line-height: 24px;
}

.content-list-feature__count {
  margin: 0;
  color: var(--catalog-muted);
  font-size: 12px;
}

.content-list-feature__description {
  width: 100%;
  margin: 0;
  color: var(--catalog-muted);
  font-size: 13px;
  line-height: 20px;
}

@media (max-width: 767px) {
  .content-list-feature__main {
    width: calc(100% - 32px);
    padding-top: 24px;
  }
}
</style>
