<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { isContentAssetUrl } from '@isport/shared'
import { toDocumentPreviewUrl } from '~/utils/document-preview'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps<{ url: string; title: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const safeSource = computed(() => isContentAssetUrl(props.url))
const previewUrl = computed(() => {
  if (!safeSource.value) return ''
  return toDocumentPreviewUrl(props.url, String(runtimeConfig.public.documentPreviewBase ?? ''))
})
watch(safeSource, value => {
  if (!value) emit('error')
})

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => !safeSource.value,
  () => t('media.missing'),
)
</script>

<template>
  <PreviewFrame :title="title">
    <ContextHolder />
    <iframe
      v-if="safeSource"
      class="document-preview__frame"
      data-testid="document-preview"
      :src="previewUrl"
      :title="title"
      loading="lazy"
      allow="fullscreen"
      referrerpolicy="no-referrer"
    />
  </PreviewFrame>
</template>

<style lang="scss" scoped>
.document-preview {
  &__frame {
    display: block;
    width: 100%;
    min-height: 70vh;
    border: 0;
    background: #fff;
  }
}
</style>
