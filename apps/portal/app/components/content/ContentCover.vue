<script setup lang="ts">
import { isContentAssetUrl, type WebDetailType } from '@isport/shared'
import ContentTypeIcon from './ContentTypeIcon.vue'
import { useApiUrl } from '~/utils/api-url'

const props = withDefaults(
  defineProps<{ src?: string; type: WebDetailType; iconSize?: number }>(),
  { src: '', iconSize: 40 },
)
const apiUrl = useApiUrl()
const failed = shallowRef(false)
const cover = computed(() => apiUrl(props.src))
const defaults: Partial<Record<WebDetailType, string>> = {
  AUDIO: 'audio',
  VIDEO: 'video',
  IMAGE: 'image',
  DOCUMENT: 'courseware',
}
const source = computed(() => {
  if (isContentAssetUrl(cover.value) && !failed.value) return cover.value
  const name = defaults[props.type]
  return name ? `/catalog/covers/${name}.webp` : ''
})
watch(cover, () => {
  failed.value = false
})
</script>

<template>
  <span class="content-cover image-zoom">
    <img
      v-if="source"
      class="image-zoom__image"
      :src="source"
      alt=""
      loading="lazy"
      decoding="async"
      @error="failed = true"
    />
    <ContentTypeIcon v-else :type="type" :size="iconSize" />
  </span>
</template>

<style lang="scss" scoped>
.content-cover {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;

  > img:not(.content-type-icon) {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
