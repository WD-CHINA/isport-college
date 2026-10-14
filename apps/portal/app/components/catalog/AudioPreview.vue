<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import PreviewFrame from './PreviewFrame.vue'

defineProps<{ url: string; title: string }>()
const VueWavePlayer = defineAsyncComponent(() =>
  import('vue-wave-player').then(module => module.VueWavePlayer),
)
</script>

<template>
  <PreviewFrame :title="title">
    <ClientOnly>
      <VueWavePlayer
        class="audio-preview"
        data-testid="audio-preview"
        :src="url"
        show-playback-rate
        :playback-rates="[0.5, 1, 1.25, 1.5, 2]"
        primary-color="var(--ic-color-brand-500)"
        background-color="#fff"
      />
    </ClientOnly>
  </PreviewFrame>
</template>

<style scoped>
.audio-preview {
  width: 100%;
}
</style>
