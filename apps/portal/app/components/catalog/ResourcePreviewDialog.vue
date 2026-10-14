<script setup lang="ts">
import { isPublicHttpUrl, type WebContentCard } from '@isport/shared'
import { RichTextContent } from '@isport/rich-text'
import { useContentDetail } from '~/composables/catalog/useContentDetail'
import { useApiUrl } from '~/utils/api-url'
import { toContentMedia } from '~/utils/content-media'
import MediaPreview from './MediaPreview.vue'
import InteractionBar from './InteractionBar.vue'

const props = defineProps<{ content: WebContentCard }>()
const emit = defineEmits<{ viewed: [contentKey: string, count: number]; closed: [] }>()
const open = defineModel<boolean>('open', { required: true })
const { t } = useI18n()
const apiUrl = useApiUrl()
const {
  request,
  stats,
  pending,
  notFound,
  interactionFailed,
  viewFailed,
  setInteraction,
  reportView,
  refresh,
} = useContentDetail(String(props.content.originId), 'resource', { recommendations: false })
const { data, status, error } = request
const detail = computed(() => data.value?.detail)
const media = computed(() => toContentMedia(detail.value?.mediaList ?? [], apiUrl))
const externalUrl = computed(() => {
  const url = apiUrl(detail.value?.jumpUrl)
  return detail.value?.detailType === 'LINK' && isPublicHttpUrl(url) ? url : ''
})
watch(
  () => detail.value?.viewCount,
  count => {
    if (open.value && count !== undefined) emit('viewed', props.content.contentKey, count)
  },
)
</script>

<template>
  <AModal
    v-model:open="open"
    :title="detail?.title || content.title"
    :width="960"
    :z-index="900"
    :footer="null"
    centered
    destroy-on-hidden
    :after-close="() => emit('closed')"
  >
    <div class="resource-preview-dialog">
      <AAlert
        v-if="error"
        type="error"
        show-icon
        :title="t(notFound ? 'detail.notFound' : 'academy.requestFailed')"
      >
        <template v-if="!notFound" #action
          ><AButton @click="refresh">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
      <template v-else-if="detail">
        <RichTextContent v-if="detail.detailType === 'ARTICLE'" :content="detail.htmlBody" />
        <p v-else-if="detail.detailType === 'LINK' && externalUrl">
          <a :href="externalUrl" target="_blank" rel="noopener noreferrer">{{
            t('catalog.external')
          }}</a>
        </p>
        <template v-else>
          <MediaPreview
            v-for="(item, index) in media"
            :key="`${item.url}-${index}`"
            :media="item"
            :title="detail.title"
          />
          <p v-if="!media.length">{{ t('media.missing') }}</p>
        </template>
        <InteractionBar
          v-if="stats && detail.interactive"
          :stats="stats"
          :pending="pending || status === 'pending'"
          @change="setInteraction"
        />
        <AAlert
          v-if="interactionFailed"
          type="error"
          show-icon
          :title="t('detail.interactionFailed')"
        />
        <AAlert v-if="viewFailed" type="warning" show-icon :title="t('detail.viewFailed')">
          <template #action
            ><AButton @click="reportView">{{ t('catalog.retry') }}</AButton></template
          >
        </AAlert>
      </template>
      <ASkeleton v-else active />
    </div>
  </AModal>
</template>

<style scoped>
.resource-preview-dialog {
  display: grid;
  max-height: 75vh;
  gap: 16px;
  overflow-y: auto;
}
</style>
