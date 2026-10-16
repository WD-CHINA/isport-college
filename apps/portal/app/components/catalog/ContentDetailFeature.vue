<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { useContentDetail } from '~/composables/catalog/useContentDetail'
import { useApiUrl } from '~/utils/api-url'
import ArticleDetailLayout from './ArticleDetailLayout.vue'
import ResourceDetailLayout from './ResourceDetailLayout.vue'
import InteractionBar from './InteractionBar.vue'
import MediaPreview from './MediaPreview.vue'
import { toContentMedia } from '~/utils/content-media'

const props = defineProps<{
  id: string
  channel: 'resource' | 'research' | 'school'
  kind: 'article' | 'resource'
}>()
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
} = useContentDetail(props.id, props.channel, props.kind, {
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
const mediaItems = computed(() => toContentMedia(data.value?.detail.mediaList ?? [], apiUrl))
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
  <main class="content-detail" :class="data ? 'content-detail--layout' : 'ic-container'">
    <ContextHolder />
    <template v-if="error">
      <h1 v-if="notFound">{{ t('detail.notFound') }}</h1>
      <AButton v-else @click="refresh">{{ t('catalog.retry') }}</AButton>
      <NuxtLink :to="localePath('/')">{{ t('common.backHome') }}</NuxtLink>
    </template>
    <component
      :is="kind === 'article' ? ArticleDetailLayout : ResourceDetailLayout"
      v-else-if="data"
      :content="data.detail"
      :channel="channel"
      :recommendations="recommendations"
    >
      <template v-if="kind === 'resource'" #preview>
        <MediaPreview :items="mediaItems" :title="data.detail.title" />
      </template>
      <template v-if="(stats && data.detail.interactive) || viewFailed" #interactions>
        <InteractionBar
          v-if="stats && data.detail.interactive"
          :stats="stats"
          :pending="pending || status === 'pending'"
          @change="setInteraction"
        />
        <AButton v-if="viewFailed" @click="reportView">{{ t('catalog.retry') }}</AButton>
      </template>
    </component>
    <ASkeleton v-else active />
  </main>
</template>

<style lang="scss" scoped>
.content-detail {
  padding-top: 32px;
  padding-bottom: 56px;

  &--layout {
    padding: 0;
  }
}
</style>
