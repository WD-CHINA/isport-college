<script setup lang="ts">
import { useContentDetail } from '../composables/useContentDetail'
import { isPublicHttpUrl, type MediaAsset, type WebMediaItem } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import { RichTextContent } from '@isport/rich-text'
import ContentDetailShell from './ContentDetailShell.vue'
import ContentGrid from '~/components/content/ContentGrid.vue'
import InteractionBar from './InteractionBar.vue'
import MediaPreview from './MediaPreview.vue'

const props = defineProps<{ id: string; channel: 'resource' | 'research' | 'school' }>()
const { t } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
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
} = useContentDetail(props.id, props.channel)
const { data, error, status } = request
const { data: recommendations } = recommendationsRequest
function toAsset(item: WebMediaItem): MediaAsset {
  const documentKind = /\.pptx?($|\?)/i.test(item.fileUrl) ? 'ppt' : 'pdf'
  const kinds = { VIDEO: 'video', AUDIO: 'audio', IMAGE: 'image', DOCUMENT: documentKind } as const
  return {
    kind: kinds[item.mediaType],
    url: apiUrl(item.fileUrl),
    duration: item.durationSec ?? undefined,
    pageCount: item.pageCount ?? undefined,
  }
}
const mediaItems = computed(() => {
  const detail = data.value?.detail
  if (!detail || detail.detailType === 'ARTICLE' || detail.detailType === 'LINK') return []
  return detail.mediaList.map(toAsset)
})
const externalUrl = computed(() => {
  const url = apiUrl(data.value?.detail.jumpUrl)
  return data.value?.detail.detailType === 'LINK' && isPublicHttpUrl(url) ? url : ''
})
useSeoMeta({
  title: () => data.value?.detail.title || t('detail.notFound'),
  description: () => data.value?.detail.summary || '',
})
await request
if (import.meta.server && notFound.value) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}
</script>

<template>
  <main class="content-detail ic-container">
    <template v-if="error">
      <h1 v-if="notFound">{{ t('detail.notFound') }}</h1>
      <AAlert v-else type="error" :title="t('academy.requestFailed')" show-icon>
        <template #action
          ><AButton @click="refresh">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
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
          <a v-if="externalUrl" :href="externalUrl" target="_blank" rel="noopener noreferrer">{{
            t('catalog.external')
          }}</a>
        </p>
        <template v-else>
          <MediaPreview
            v-for="(item, index) in mediaItems"
            :key="`${item.url}-${index}`"
            :media="item"
            :title="data.detail.title"
          />
        </template>
        <template #interactions>
          <InteractionBar
            v-if="stats && data.detail.interactive"
            :stats="stats"
            :pending="pending || status === 'pending'"
            @change="setInteraction"
          />
          <AAlert
            v-if="interactionFailed"
            type="error"
            :title="t('detail.interactionFailed')"
            show-icon
          />
          <AAlert v-if="viewFailed" type="warning" :title="t('detail.viewFailed')" show-icon>
            <template #action
              ><AButton @click="reportView">{{ t('catalog.retry') }}</AButton></template
            >
          </AAlert>
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

<style scoped>
.content-detail {
  padding-top: 32px;
  padding-bottom: 56px;
}

.content-detail__recommendations {
  margin-top: 40px;
}
</style>
