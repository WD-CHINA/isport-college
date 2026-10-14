<script setup lang="ts">
import { isContentAssetUrl, type MediaAsset } from '@isport/shared'
import AudioPreview from './AudioPreview.vue'
import DocumentPreview from './DocumentPreview.vue'
import ImageCarouselPreview from './ImageCarouselPreview.vue'
import VideoPreview from './VideoPreview.vue'

const props = defineProps<{ items: MediaAsset[]; title: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const images = computed(() => props.items.filter(item => item.kind === 'image'))
const others = computed(() => props.items.filter(item => item.kind !== 'image'))
</script>

<template>
  <div class="media-preview">
    <ImageCarouselPreview
      v-if="images.length"
      :images="images"
      :title="title"
      @error="emit('error')"
    />
    <template v-for="(item, index) in others" :key="`${item.kind}-${item.url}-${index}`">
      <VideoPreview
        v-if="item.kind === 'video' && isContentAssetUrl(item.url)"
        :url="item.url"
        :title="title"
        @error="emit('error')"
      />
      <AudioPreview
        v-else-if="item.kind === 'audio' && isContentAssetUrl(item.url)"
        :url="item.url"
        :title="title"
      />
      <DocumentPreview
        v-else-if="(item.kind === 'pdf' || item.kind === 'ppt') && isContentAssetUrl(item.url)"
        :url="item.url"
        :title="title"
        @error="emit('error')"
      />
      <AAlert v-else type="error" :title="t('media.missing')" show-icon />
    </template>
    <p v-if="!items.length">{{ t('media.missing') }}</p>
  </div>
</template>

<style scoped>
.media-preview {
  display: grid;
  gap: 16px;
}
</style>
