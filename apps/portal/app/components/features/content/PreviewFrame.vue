<script setup lang="ts">
import { Button as AButton } from 'antdv-next'

defineProps<{ title: string }>()
const { t } = useI18n()
const target = useTemplateRef<HTMLElement>('target')
const { expanded, fallback, toggle } = useExpandedPreview(target)
</script>

<template>
  <section
    ref="target"
    tabindex="-1"
    class="preview-frame"
    :class="{ 'preview-frame--expanded': fallback }"
    :aria-label="title"
    :role="fallback ? 'dialog' : undefined"
    :aria-modal="fallback || undefined"
  >
    <div class="preview-frame__toolbar">
      <span>{{ title }}</span>
      <AButton @click="toggle">{{
        t(expanded ? 'media.exitFullscreen' : 'media.fullscreen')
      }}</AButton>
    </div>
    <p v-if="fallback" class="preview-frame__notice" role="status">{{ t('media.fallback') }}</p>
    <div class="preview-frame__content"><slot /></div>
  </section>
</template>

<style scoped>
.preview-frame {
  overflow: hidden;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  background: #f1f5f9;
}

.preview-frame__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
  background: #fff;
}

.preview-frame__notice {
  padding: 0 12px;
  color: #475569;
}

.preview-frame__content {
  min-width: 0;
  overflow: auto;
  padding: 12px;
}

.preview-frame--expanded,
.preview-frame:fullscreen {
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0;
  z-index: 1100;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0;
}

.preview-frame--expanded .preview-frame__content,
.preview-frame:fullscreen .preview-frame__content {
  flex: 1;
}
</style>
