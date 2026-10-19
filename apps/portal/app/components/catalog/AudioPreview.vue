<script setup lang="ts">
import { UiAudioPlayer } from '@isport/ui-core'
import PreviewFrame from './PreviewFrame.vue'

defineProps<{ url: string; title: string }>()
const { t } = useI18n()
const labels = computed(() => ({
  play: t('media.play'),
  pause: t('media.pause'),
  seek: t('media.seek'),
  mute: t('media.mute'),
  unmute: t('media.unmute'),
  volume: t('media.volume'),
  speed: t('media.speed'),
  more: t('media.moreAudio'),
  restart: t('media.restart'),
  loop: t('media.loop'),
  loading: t('common.loading'),
  failed: t('media.failed'),
  playbackFailed: t('media.playbackFailed'),
  retry: t('catalog.retry'),
}))
</script>

<template>
  <PreviewFrame :title="title">
    <UiAudioPlayer
      class="audio-preview"
      data-testid="audio-preview"
      :src="url"
      :title="title"
      :labels="labels"
    />
  </PreviewFrame>
</template>

<style lang="scss" scoped>
.audio-preview {
  width: 100%;
}
</style>
