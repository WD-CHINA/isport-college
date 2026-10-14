<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { parseListPage } from '@isport/shared'
import AppPagination from '~/components/app/AppPagination.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import { useAcademy } from '~/composables/useAcademy'
import {
  formatPublishedAt,
  isContentAssetUrl,
  isPublicHttpUrl,
  WEB_PAGE_SIZE,
} from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

const academy = useAcademy()
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const page = computed(() => parseListPage(route.query.page))
const request = useAsyncData(
  () => `academy:news:${locale.value}:${page.value}`,
  (_app, { signal }) => academy.news({ pageNum: page.value, pageSize: WEB_PAGE_SIZE }, signal),
)
const { data, error, refresh } = request
useSeoMeta({ title: () => t('academy.news') })
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request
function changePage(next: number) {
  return router.push({ path: route.path, query: next > 1 ? { page: String(next) } : {} })
}
function href(id: number, detailType: string, jumpUrl: string) {
  const target = apiUrl(jumpUrl)
  return detailType === 'LINK' && isPublicHttpUrl(target) ? target : localePath(`/news/${id}`)
}
</script>

<template>
  <main class="container-page catalog-page">
    <ContextHolder />
    <h1>{{ t('academy.news') }}</h1>
    <AButton v-if="error" @click="refresh()">{{ t('catalog.retry') }}</AButton>
    <ul v-else-if="data?.list.length" class="catalog-page__news">
      <li v-for="item in data.list" :key="item.id">
        <NuxtLink
          :to="href(item.id, item.detailType, item.jumpUrl)"
          :external="item.detailType === 'LINK' && isPublicHttpUrl(apiUrl(item.jumpUrl))"
          :target="item.detailType === 'LINK' ? '_blank' : undefined"
        >
          <img
            v-if="isContentAssetUrl(apiUrl(item.coverUrl))"
            :src="apiUrl(item.coverUrl)"
            alt=""
          />
          <strong>{{ item.title }}</strong>
          <span>{{ item.summary }}</span>
          <time v-if="formatPublishedAt(item.publishedAt)">{{
            formatPublishedAt(item.publishedAt)
          }}</time>
        </NuxtLink>
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

    img {
      width: min(100%, 320px);
      aspect-ratio: 16 / 9;
      object-fit: cover;
      border-radius: 8px;
    }
  }
}
</style>
