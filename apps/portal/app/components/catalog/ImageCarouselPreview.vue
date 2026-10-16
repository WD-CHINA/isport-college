<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { isContentAssetUrl, type MediaAsset } from '@isport/shared'
import ResourceImageGallery from './ResourceImageGallery.vue'

const props = defineProps<{ images: MediaAsset[]; title: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const safeImages = computed(() => props.images.filter(item => isContentAssetUrl(item.url)))
const failed = shallowRef(false)
function handleError() {
  failed.value = true
  emit('error')
}
watch(
  () => props.images,
  items => {
    failed.value = false
    if (items.length && !safeImages.value.length) emit('error')
  },
  { immediate: true },
)

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => !safeImages.value.length || failed.value,
  () => t('media.missing'),
)
</script>

<template>
  <ContextHolder />
  <ResourceImageGallery
    v-if="safeImages.length"
    :images="safeImages"
    :title="title"
    @error="handleError"
  />
</template>
