<script setup lang="ts">
import { useAcademy } from '~/composables/useAcademy'
import { apiErrorCode } from '~/api/errors'
import { formatPublishedAt, isPublicHttpUrl } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import { RichTextContent } from '@isport/rich-text'
import { Alert as AAlert, Button as AButton } from 'antdv-next'

const props = defineProps<{ id: string }>()
const academy = useAcademy()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const newsId = /^[1-9]\d{0,15}$/.test(props.id) ? Number(props.id) : 0
const request = useAsyncData(
  () => `academy:news:${locale.value}:${props.id}`,
  () => {
    if (!newsId) throw createError({ statusCode: 404, statusMessage: t('detail.notFound') })
    return academy.newsDetail(newsId)
  },
)
const { data, error, refresh } = request
const notFound = computed(
  () => error.value?.statusCode === 404 || apiErrorCode(error.value) === 'NOT_FOUND',
)
const external = computed(() =>
  data.value?.detailType === 'LINK' && isPublicHttpUrl(apiUrl(data.value.jumpUrl))
    ? apiUrl(data.value.jumpUrl)
    : '',
)
useSeoMeta({
  title: () => data.value?.title || t('detail.notFound'),
  description: () => data.value?.summary || '',
})
await request
if (import.meta.server && notFound.value) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}
</script>

<template>
  <main class="container-page news-detail">
    <template v-if="error">
      <h1 v-if="notFound">{{ t('detail.notFound') }}</h1>
      <AAlert v-else type="error" show-icon :title="t('academy.requestFailed')">
        <template #action
          ><AButton @click="refresh()">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
    </template>
    <article v-else-if="data">
      <NuxtLink :to="localePath('/news')">{{ t('academy.news') }}</NuxtLink>
      <h1>{{ data.title }}</h1>
      <p>{{ data.categoryName }}</p>
      <time v-if="formatPublishedAt(data.publishedAt)">{{
        formatPublishedAt(data.publishedAt)
      }}</time>
      <p>{{ data.summary }}</p>
      <RichTextContent v-if="data.detailType === 'ARTICLE'" :content="data.htmlBody" />
      <p v-else-if="external">
        <a :href="external" target="_blank" rel="noopener noreferrer">{{
          t('catalog.external')
        }}</a>
      </p>
    </article>
  </main>
</template>

<style scoped>
.news-detail {
  display: grid;
  gap: 12px;
  padding-top: 32px;
  padding-bottom: 56px;
}

.news-detail h1 {
  margin: 12px 0 0;
}
</style>
