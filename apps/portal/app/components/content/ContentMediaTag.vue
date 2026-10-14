<script setup lang="ts">
import type { WebDetailType } from '@isport/shared'
const props = defineProps<{ type: WebDetailType }>()
const { t } = useI18n()
const media = computed(
  () =>
    ({
      VIDEO: { key: 'video', icon: 'ee3bb.svg' },
      AUDIO: { key: 'audio', icon: '5b8fd.svg' },
      DOCUMENT: { key: 'courseware', icon: '4f72c.svg' },
      IMAGE: { key: 'image', icon: 'e2df2.svg' },
      LINK: { key: 'link', icon: '4f72c.svg' },
      ARTICLE: { key: 'article', icon: '4f72c.svg' },
    })[props.type],
)
</script>
<template>
  <span class="content-media-tag"
    ><img :src="`/home/figma/${media.icon}`" alt="" />{{ t(`catalog.media.${media.key}`) }}</span
  >
</template>
<style scoped>
.content-media-tag {
  display: inline-flex;
  width: fit-content;
  height: 20px;
  align-items: center;
  gap: 4px;
  padding: 1px 4px;
  border: 0.5px solid #2cb8c5;
  border-radius: 3px;
  color: #05a4b6;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.content-media-tag img {
  display: block;
  flex: none;
}
</style>
