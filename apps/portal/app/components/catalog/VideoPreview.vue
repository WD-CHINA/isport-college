<script setup lang="ts">
import { message } from 'antdv-next'
import { useMessageFeedback } from '~/composables/useMessageFeedback'
import PreviewFrame from './PreviewFrame.vue'

const props = defineProps<{ url: string; title: string; poster?: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const host = useTemplateRef<HTMLElement>('host')
const failed = shallowRef(false)
const reloadRequired = shallowRef(false)
const attempt = shallowRef(0)
let player: { destroy: () => void; on: (event: string, handler: () => void) => void } | null = null
let generation = 0

async function mountPlayer() {
  const current = ++generation
  player?.destroy()
  player = null
  failed.value = false
  reloadRequired.value = false
  if (!import.meta.client || !host.value) return
  const element = host.value
  let moduleLoaded = false
  try {
    const { default: XgPlayer } = await import('xgplayer')
    await import('xgplayer/dist/index.min.css')
    if (current !== generation || host.value !== element) return
    moduleLoaded = true
    player = new XgPlayer({
      el: element,
      url: props.url,
      poster: props.poster,
      lang: 'zh-cn',
      width: '100%',
      height: '100%',
      autoplay: false,
      playsinline: true,
      cssFullscreen: false,
      playbackRate: [0.5, 1, 1.25, 1.5, 2],
    })
    player.on('error', () => {
      if (current !== generation) return
      failed.value = true
      emit('error')
    })
  } catch {
    if (current !== generation || host.value !== element) return
    reloadRequired.value = !moduleLoaded
    failed.value = true
    emit('error')
  }
}
function retry() {
  if (reloadRequired.value) {
    // 浏览器会缓存失败的模块导入；重新加载页面才能重新获取分块。
    reloadNuxtApp({ force: true })
    return
  }
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
  generation++
  player?.destroy()
  player = null
})

const [messageApi, ContextHolder] = message.useMessage()
useMessageFeedback(messageApi, failed, () => t('media.failed'))
</script>

<template>
  <PreviewFrame :title="title">
    <ContextHolder />
    <div class="video-preview__stage">
      <div v-if="failed" class="video-preview__error" role="status">
        <p>{{ t('media.failed') }}</p>
        <AButton type="primary" class="video-preview__retry" @click="retry">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 7v5h-5M4 17v-5h5" />
              <path d="M6.1 6.1a8 8 0 0 1 13.2 3M4.7 14.9a8 8 0 0 0 13.2 3" />
            </svg>
          </template>
          {{ t('catalog.retry') }}
        </AButton>
      </div>
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
    width: 56px !important;
    height: 56px !important;
    border-radius: 50% !important;
    overflow: hidden !important;

    xg-start-inner {
      background: var(--ic-color-academy-primary) !important;
    }
  }

  :deep(.xgplayer-poster) {
    background-size: cover;
  }

  &__stage {
    position: relative;
    width: 100%;
    height: 100%;

    &::before {
      display: block;
      padding-top: 56.25%;
      content: '';
    }

    .video-preview {
      position: absolute;
      inset: 0;
      height: 100%;
      min-height: 0;
    }
  }

  &__error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    background: var(--ic-color-academy-background-section);
    text-align: center;

    p {
      max-width: 360px;
      margin: 0;
      color: var(--ic-color-academy-text-muted);
      font-size: 14px;
      line-height: 22px;
    }
  }

  &__retry {
    height: 40px;
    flex: none;
    padding-inline: 20px;
    border-radius: 6px;
    box-shadow: none;

    svg {
      display: block;
      width: 16px;
      height: 16px;
      stroke: currentcolor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }
}
</style>
