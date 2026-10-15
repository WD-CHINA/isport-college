<script setup lang="ts">
import type { WebDetailType } from '@isport/shared'
import { contentMediaIcon } from './content-media'

const props = defineProps<{ type: WebDetailType }>()
const { t } = useI18n()
const labels: Record<WebDetailType, string> = {
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'courseware',
  IMAGE: 'image',
  LINK: 'link',
  ARTICLE: 'article',
}
const label = computed(() => labels[props.type])
</script>
<template>
  <span class="content-media-tag"
    ><img :src="contentMediaIcon(type)" alt="" />{{ t(`catalog.media.${label}`) }}</span
  >
</template>
<style lang="scss" scoped>
.content-media-tag {
  display: inline-flex;
  width: fit-content;
  height: 20px;
  align-items: center;
  gap: 4px;
  padding: 1px 4px;
  border: 0.5px solid var(--ic-color-academy-media-accent);
  border-radius: 3px;
  color: var(--ic-color-academy-media-text);
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;

  img {
    display: block;
    flex: none;
  }
}
</style>
