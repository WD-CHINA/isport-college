<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { useContentDetail } from '~/composables/catalog/useContentDetail'
import { isPublicHttpUrl } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import ContentLink from '~/components/content/ContentLink.vue'
import { RichTextContent } from '@isport/rich-text'
import ContentDetailShell from './ContentDetailShell.vue'
import ContentGrid from '~/components/content/ContentGrid.vue'
import InteractionBar from './InteractionBar.vue'
import MediaPreview from './MediaPreview.vue'
import { toContentMedia } from '~/utils/content-media'

const props = defineProps<{ id: string; channel: 'resource' | 'research' | 'school' }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const [messageApi, ContextHolder] = message.useMessage()
const {
  request,
  recommendations: recommendationsRequest,
  stats,
  notFound,
  pending,
  interactionFailed,
  viewFailed,
  setInteraction,
  reportView,
  refresh,
} = useContentDetail(props.id, props.channel, {
  onInteractionSuccess: (kind, active) => {
    const key =
      kind === 'like'
        ? active
          ? 'detail.likeSuccess'
          : 'detail.unlikeSuccess'
        : active
          ? 'detail.favoriteSuccess'
          : 'detail.unfavoriteSuccess'
    messageApi.success(t(key))
  },
})
const { data, error, status } = request
const { data: recommendations } = recommendationsRequest
const mediaItems = computed(() => {
  const detail = data.value?.detail
  if (!detail || detail.detailType === 'ARTICLE' || detail.detailType === 'LINK') return []
  return toContentMedia(detail.mediaList, apiUrl)
})
const externalUrl = computed(() => {
  const url = apiUrl(data.value?.detail.jumpUrl)
  return data.value?.detail.detailType === 'LINK' && isPublicHttpUrl(url) ? url : ''
})
useSeoMeta({
  title: () => data.value?.detail.title || t('detail.notFound'),
  description: () => data.value?.detail.summary || '',
})
useMessageFeedback(
  messageApi,
  () => error.value && !notFound.value,
  () => t('academy.requestFailed'),
)
useMessageFeedback(messageApi, interactionFailed, () => t('detail.interactionFailed'))
useMessageFeedback(messageApi, viewFailed, () => t('detail.viewFailed'), 'warning')
await request
if (import.meta.server && notFound.value) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}
</script>

<template>
  <main class="content-detail ic-container">
    <ContextHolder />
    <template v-if="error">
      <h1 v-if="notFound">{{ t('detail.notFound') }}</h1>
      <AButton v-else @click="refresh">{{ t('catalog.retry') }}</AButton>
      <NuxtLink :to="localePath('/')">{{ t('common.backHome') }}</NuxtLink>
    </template>
    <template v-else-if="data">
      <ContentDetailShell :content="data.detail">
        <RichTextContent
          v-if="data.detail.detailType === 'ARTICLE'"
          :content="data.detail.htmlBody"
          show-toc
          :toc-label="t('detail.toc')"
        />
        <p v-else-if="data.detail.detailType === 'LINK'">
          <ContentLink v-if="externalUrl" :content="data.detail">{{
            t('catalog.external')
          }}</ContentLink>
        </p>
        <MediaPreview v-else :items="mediaItems" :title="data.detail.title" />
        <template #interactions>
          <InteractionBar
            v-if="stats && data.detail.interactive"
            :stats="stats"
            :pending="pending || status === 'pending'"
            @change="setInteraction"
          />
          <AButton v-if="viewFailed" @click="reportView">{{ t('catalog.retry') }}</AButton>
        </template>
      </ContentDetailShell>
      <section v-if="recommendations.length" class="content-detail__recommendations">
        <h2>{{ t('detail.recommendations') }}</h2>
        <ContentGrid :items="recommendations" />
      </section>
    </template>
    <ASkeleton v-else active />
  </main>
</template>

<style lang="scss" scoped>
.content-detail {
  padding-top: 32px;
  padding-bottom: 56px;

  &__recommendations {
    margin-top: 40px;
  }
}
</style>
