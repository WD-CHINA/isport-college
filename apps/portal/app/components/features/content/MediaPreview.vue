<script setup lang="ts">
import { isLocalImageUrl, isLocalMediaUrl, type MediaAsset } from '@isport/shared'
import { Alert as AAlert, Button as AButton } from 'antdv-next'
import PdfPreview from './PdfPreview.vue'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps<{ media: MediaAsset; title: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const player = useTemplateRef<HTMLMediaElement>('player')
const failed = shallowRef(false)
const playing = shallowRef(false)
const attempt = shallowRef(0)
const speed = shallowRef('1')
const safeSource = computed(() =>
  props.media.kind === 'image'
    ? isLocalImageUrl(props.media.url)
    : isLocalMediaUrl(props.media.url),
)
function failure() {
  failed.value = true
  playing.value = false
  emit('error')
}
function retry() {
  failed.value = false
  playing.value = false
  attempt.value++
  speed.value = '1'
}
function changeSpeed() {
  if (player.value) player.value.playbackRate = Number(speed.value)
}
watch(() => props.media, retry)
onBeforeUnmount(() => player.value?.pause())
</script>

<template>
  <div v-if="media.kind === 'ppt'" class="media-preview__placeholder">
    <strong>{{ media.filename || 'PPT' }}</strong>
    <p>{{ t('media.pptNotice') }}</p>
    <span v-if="media.size">{{ Math.ceil(media.size / 1024) }} KB</span>
  </div>
  <PdfPreview
    v-else-if="media.kind === 'pdf'"
    :source="media.url"
    :title="title"
    @error="emit('error')"
  />
  <PreviewFrame v-else :title="title">
    <AAlert
      v-if="!safeSource || failed"
      type="error"
      :title="t(safeSource ? 'media.failed' : 'media.missing')"
      show-icon
    >
      <template #action
        ><AButton v-if="safeSource" @click="retry">{{ t('catalog.retry') }}</AButton></template
      >
    </AAlert>
    <template v-else>
      <img
        v-if="media.kind === 'image'"
        :key="attempt"
        class="media-preview__image"
        :src="media.url"
        :alt="title"
        @error="failure"
      />
      <template v-else>
        <div
          v-if="media.kind === 'audio'"
          class="media-preview__wave"
          :class="{ 'media-preview__wave--playing': playing }"
          :aria-label="t(playing ? 'media.playing' : 'media.paused')"
        >
          <i v-for="index in 5" :key="index" :style="{ animationDelay: `${index * -0.15}s` }" />
        </div>
        <component
          :is="media.kind === 'video' ? 'video' : 'audio'"
          :key="attempt"
          ref="player"
          class="media-preview__player"
          :src="media.url"
          controls
          playsinline
          preload="metadata"
          :aria-label="title"
          @play="playing = true"
          @pause="playing = false"
          @ended="playing = false"
          @waiting="playing = false"
          @playing="playing = true"
          @error="failure"
        />
        <label class="media-preview__speed"
          >{{ t('media.speed') }}
          <select v-model="speed" :aria-label="t('media.speed')" @change="changeSpeed">
            <option v-for="rate in ['0.5', '1', '1.25', '1.5', '2']" :key="rate" :value="rate">
              {{ rate }}×
            </option>
          </select>
        </label>
      </template>
    </template>
  </PreviewFrame>
</template>

<style scoped>
.media-preview__placeholder {
  padding: 40px 24px;
  text-align: center;
  border-radius: 12px;
  background: #eff6ff;
}

.media-preview__image {
  display: block;
  max-width: 100%;
  height: auto;
  margin: auto;
}

.media-preview__player {
  display: block;
  width: 100%;
  max-height: 70vh;
}

.media-preview__speed {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.media-preview__speed select {
  min-height: 36px;
}

.media-preview__wave {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 160px;
}

.media-preview__wave i {
  width: 10px;
  height: 64px;
  border-radius: 8px;
  background: #2563eb;
  transform: scaleY(0.3);
  animation: wave 0.8s ease-in-out infinite alternate;
  animation-play-state: paused;
}

.media-preview__wave--playing i {
  animation-play-state: running;
}

@keyframes wave {
  to {
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .media-preview__wave i {
    animation: none;
  }

  .media-preview__wave--playing i {
    transform: scaleY(1);
  }
}
</style>
