<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps<{ url: string; title: string; poster?: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const host = useTemplateRef<HTMLElement>('host')
const failed = shallowRef(false)
const attempt = shallowRef(0)
let player: { destroy: () => void; on: (event: string, handler: () => void) => void } | null = null

async function mountPlayer() {
  player?.destroy()
  player = null
  failed.value = false
  if (!import.meta.client || !host.value) return
  const { default: XgPlayer } = await import('xgplayer')
  await import('xgplayer/dist/index.min.css')
  player = new XgPlayer({
    el: host.value,
    url: props.url,
    poster: props.poster,
    lang: 'zh-cn',
    width: '100%',
    height: '100%',
    autoplay: false,
    playsinline: true,
    playbackRate: [0.5, 1, 1.25, 1.5, 2],
  })
  player.on('error', () => {
    failed.value = true
    emit('error')
  })
}
function retry() {
  attempt.value++
  void nextTick(mountPlayer)
}

onMounted(mountPlayer)
watch(
  () => [props.url, props.poster],
  () => {
    attempt.value++
    void nextTick(mountPlayer)
  },
)
onBeforeUnmount(() => {
  player?.destroy()
  player = null
})

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, failed, () => t('media.failed'))
</script>

<template>
  <PreviewFrame :title="title">
    <ContextHolder />
    <AButton v-if="failed" @click="retry">{{ t('catalog.retry') }}</AButton>
    <div class="video-preview__stage">
      <div
        v-show="!failed"
        :key="attempt"
        ref="host"
        class="video-preview"
        data-testid="video-preview"
      />
    </div>
  </PreviewFrame>
</template>

<style lang="scss" scoped>
.video-preview {
  width: 100%;
  min-height: 240px;
  background: #000;

  :deep(.xgplayer-start) {
    width: 56px;
    height: 56px;

    xg-start-inner {
      background: var(--ic-color-academy-primary);
    }
  }

  :deep(.xgplayer-poster) {
    background-size: cover;
  }

  &__stage {
    width: 100%;
    aspect-ratio: 16 / 9;

    .video-preview {
      min-height: 0;
      aspect-ratio: 16 / 9;
    }
  }
}
</style>
