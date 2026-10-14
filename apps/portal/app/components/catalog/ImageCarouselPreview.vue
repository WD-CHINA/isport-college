<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import { isContentAssetUrl, type MediaAsset } from '@isport/shared'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps<{ images: MediaAsset[]; title: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const safeImages = computed(() => props.images.filter(item => isContentAssetUrl(item.url)))
watch(
  () => props.images,
  items => {
    if (items.length && !safeImages.value.length) emit('error')
  },
  { immediate: true },
)

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(
  messageApi,
  () => !safeImages.value.length,
  () => t('media.missing'),
)
</script>

<template>
  <PreviewFrame :title="title">
    <ContextHolder />
    <ACarousel
      v-if="safeImages.length"
      arrows
      dots
      class="image-carousel"
      data-testid="image-carousel"
    >
      <div v-for="(item, index) in safeImages" :key="`${item.url}-${index}`">
        <img class="image-carousel__image" :src="item.url" :alt="title" @error="emit('error')" />
      </div>
    </ACarousel>
  </PreviewFrame>
</template>

<style scoped>
.image-carousel :deep(.slick-slide) {
  text-align: center;
  line-height: 0;
  background: #0f172a0a;
}

.image-carousel__image {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
  object-fit: contain;
}
</style>
