<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { useAcademy } from '~/composables/useAcademy'
import { apiErrorCode } from '~/api/errors'
import { formatPublishedAt, isPublicHttpUrl } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import { RichTextContent } from '@isport/rich-text'

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
const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => error.value && !notFound.value,
  () => t('academy.requestFailed'),
)
await request
if (import.meta.server && notFound.value) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}
</script>

<template>
  <main class="container-page news-detail">
    <ContextHolder />
    <template v-if="error">
      <h1 v-if="notFound">{{ t('detail.notFound') }}</h1>
      <AButton v-else @click="refresh()">{{ t('catalog.retry') }}</AButton>
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

<style lang="scss" scoped>
.news-detail {
  display: grid;
  gap: 12px;
  padding-top: 32px;
  padding-bottom: 56px;

  h1 {
    margin: 12px 0 0;
  }
}
</style>
