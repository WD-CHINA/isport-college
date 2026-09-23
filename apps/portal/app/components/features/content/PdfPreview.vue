<script setup lang="ts">
import { Alert as AAlert, Button as AButton } from 'antdv-next'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps<{ source: string; title: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const { page, pages, scale, loading, rendering, failed, goTo, zoom, retry } = usePdfPreview(
  toRef(props, 'source'),
  canvas,
)
watch(failed, value => {
  if (value) emit('error')
})
function locate(event: Event) {
  goTo(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <PreviewFrame :title="title">
    <AAlert v-if="failed" type="error" :title="t('media.pdfFailed')" show-icon>
      <template #action
        ><AButton @click="retry">{{ t('catalog.retry') }}</AButton></template
      >
    </AAlert>
    <p v-else-if="loading" role="status">{{ t('media.pdfLoading') }}</p>
    <div v-show="!loading && !failed" class="pdf-preview">
      <div class="pdf-preview__controls" :aria-label="t('media.pdfControls')">
        <AButton :disabled="page <= 1" @click="goTo(page - 1)">{{ t('media.previous') }}</AButton>
        <label
          >{{ t('media.page') }}
          <input
            type="number"
            :value="page"
            min="1"
            :max="pages"
            :aria-label="t('media.page')"
            @change="locate"
        /></label>
        <span role="status">{{ t('media.pages', { page, pages }) }}</span>
        <AButton :disabled="page >= pages" @click="goTo(page + 1)">{{ t('media.next') }}</AButton>
        <AButton
          :disabled="scale <= 0.5"
          :aria-label="t('media.zoomOut')"
          @click="zoom(scale - 0.25)"
          >−</AButton
        >
        <output>{{ Math.round(scale * 100) }}%</output>
        <AButton :disabled="scale >= 2" :aria-label="t('media.zoomIn')" @click="zoom(scale + 0.25)"
          >+</AButton
        >
      </div>
      <div class="pdf-preview__page" :aria-busy="rendering">
        <canvas ref="canvas" :aria-label="t('media.pdfPage', { title, page })" role="img" />
      </div>
    </div>
  </PreviewFrame>
</template>

<style scoped>
.pdf-preview__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
}

.pdf-preview__controls input {
  width: 64px;
  min-height: 32px;
}

.pdf-preview__page {
  overflow: auto;
  max-height: 75vh;
}

.pdf-preview__page canvas {
  display: block;
  background: #fff;
}
</style>
