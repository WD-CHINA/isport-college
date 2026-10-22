<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { parseListPage } from '@isport/shared'
import AppPagination from '~/components/app/AppPagination.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import ContentLink from '~/components/content/ContentLink.vue'
import { useAcademy } from '~/composables/useAcademy'
import { formatPublishedAt, isContentAssetUrl, WEB_PAGE_SIZE } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

const academy = useAcademy()
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const apiUrl = useApiUrl()
const page = computed(() => parseListPage(route.query.page))
const request = useAsyncData(
  () => `academy:news:list:${locale.value}:${page.value}`,
  (_app, { signal }) => academy.news({ pageNum: page.value, pageSize: WEB_PAGE_SIZE }, signal),
)
const { data, error, refresh } = request
useSeoMeta({ title: () => t('academy.news'), description: () => t('seo.newsDesc') })
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request
function changePage(next: number) {
  return router.push({ path: route.path, query: next > 1 ? { page: String(next) } : {} })
}
</script>

<template>
  <main class="container-page catalog-page">
    <ContextHolder />
    <h1>{{ t('academy.news') }}</h1>
    <AButton v-if="error" @click="refresh()">{{ t('catalog.retry') }}</AButton>
    <ul v-else-if="data?.list.length" class="catalog-page__news">
      <li v-for="item in data.list" :key="item.id">
        <ContentLink :content="item" class="card-feedback">
          <span
            v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
            class="catalog-page__cover image-zoom"
          >
            <img class="image-zoom__image" :src="apiUrl(item.coverUrl)" alt="" />
          </span>
          <strong class="card-feedback__title">{{ item.title }}</strong>
          <span>{{ item.summary }}</span>
          <time v-if="formatPublishedAt(item.publishedAt)">{{
            formatPublishedAt(item.publishedAt)
          }}</time>
        </ContentLink>
      </li>
    </ul>
    <AppEmpty v-else :description="t('catalog.noResults')" />
    <AppPagination
      v-if="data"
      :total="data.total"
      :page="page"
      :page-size="data.pageSize"
      @change="changePage"
    />
  </main>
</template>

<style lang="scss" scoped>
.catalog-page {
  display: grid;
  gap: 24px;
  padding-top: 40px;
  padding-bottom: 64px;

  h1 {
    margin: 0;
  }

  &__news {
    display: grid;
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;

    a {
      display: grid;
      gap: 6px;
      color: inherit;
    }
  }

  &__cover {
    position: relative;
    width: min(100%, 320px);
    overflow: hidden;
    border-radius: 8px;

    &::before {
      display: block;
      padding-top: 56.25%;
      content: '';
    }

    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
