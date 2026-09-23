<script setup lang="ts">
import type { ContentChannel } from '@isport/shared'
import { RichTextContent } from '@isport/rich-text'
import { Alert as AAlert, Button as AButton, Skeleton as ASkeleton } from 'antdv-next'
import ContentDetailShell from './ContentDetailShell.vue'
import ContentGrid from './ContentGrid.vue'
import InteractionBar from './InteractionBar.vue'
import MediaPreview from './MediaPreview.vue'

const props = defineProps<{ id: string; channel: ContentChannel }>()
const { t } = useI18n()
const localize = useLocalizedText()
const localePath = useLocalePath()
const {
  request,
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
useSeoMeta({
  title: () => (data.value ? localize(data.value.content.title) : t('detail.notFound')),
  description: () => (data.value ? localize(data.value.content.summary) : ''),
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
      <ContentDetailShell :content="data.content" :category-label="data.categoryLabel">
        <RichTextContent
          v-if="data.content.media.kind === 'article'"
          :content="localize(data.content.body)"
          show-toc
          :toc-label="t('detail.toc')"
        />
        <MediaPreview v-else :media="data.content.media" :title="localize(data.content.title)" />
        <template #interactions>
          <InteractionBar
            v-if="stats"
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
      <section v-if="data.recommendations.length" class="content-detail__recommendations">
        <h2>{{ t('detail.recommendations') }}</h2>
        <ContentGrid :items="data.recommendations" />
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
