<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { parseListPage } from '@isport/shared'
import AppPagination from '~/components/app/AppPagination.vue'
import AppEmpty from '~/components/app/AppEmpty.vue'
import { useAcademy } from '~/composables/useAcademy'
import { isContentAssetUrl, WEB_PAGE_SIZE } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

const academy = useAcademy()
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const page = computed(() => parseListPage(route.query.page))
const keyword = computed(() => (typeof route.query.keyword === 'string' ? route.query.keyword : ''))
const request = useAsyncData(
  () => `academy:teachers:${locale.value}:${page.value}:${keyword.value}`,
  (_app, { signal }) =>
    academy.teachers(
      { keyword: keyword.value, pageNum: page.value, pageSize: WEB_PAGE_SIZE },
      signal,
    ),
)
const { data, error, refresh } = request
useSeoMeta({ title: () => t('academy.teachers'), description: () => t('seo.teachersDesc') })
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, error, () => t('academy.requestFailed'))
await request
function changePage(next: number) {
  return router.push({
    path: route.path,
    query: { ...route.query, page: next > 1 ? String(next) : undefined },
  })
}
</script>

<template>
  <main class="container-page catalog-page">
    <ContextHolder />
    <h1>{{ t('academy.teachers') }}</h1>
    <AButton v-if="error" @click="refresh()">{{ t('catalog.retry') }}</AButton>
    <ul v-else-if="data?.list.length" class="catalog-page__people">
      <li v-for="person in data.list" :key="person.id">
        <NuxtLink :to="localePath(`/teachers/${person.id}`)">
          <span
            v-if="isContentAssetUrl(apiUrl(person.avatarUrl))"
            class="catalog-page__portrait image-zoom"
          >
            <img
              class="image-zoom__image"
              :src="apiUrl(person.avatarUrl)"
              alt=""
              width="72"
              height="72"
            />
          </span>
          <strong>{{ person.name }}</strong>
          <span>{{ person.honorTitle || person.jobTitle }}</span>
          <span>{{ person.schoolOrg }}</span>
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

  &__people {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
    margin: 0;
    padding: 0;
    list-style: none;

    a {
      display: grid;
      gap: 4px;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      color: inherit;
      background: #fff;
    }

    .catalog-page__portrait {
      display: block;
      width: 72px;
      height: 72px;
      border-radius: 50%;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style>
