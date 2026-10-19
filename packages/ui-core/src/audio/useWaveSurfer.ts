import { onBeforeUnmount, onMounted, readonly, shallowRef, watch } from 'vue'
import type { ShallowRef } from 'vue'
import type WaveSurfer from 'wavesurfer.js'
import type { AudioWaveformOptions } from './types'

/** 只管理传入的媒体资源，不访问应用接口、路由或会话。 */
export function useWaveSurfer(options: {
  src: () => string
  container: ShallowRef<HTMLElement | null>
  media: ShallowRef<HTMLAudioElement | null>
  waveformOptions: () => AudioWaveformOptions | undefined
  onReady?: (duration: number) => void
  onError?: (error: unknown) => void
}) {
  const ready = shallowRef(false)
  const failed = shallowRef(false)
  const playbackFailed = shallowRef(false)
  const playing = shallowRef(false)
  const currentTime = shallowRef(0)
  const duration = shallowRef(0)
  const volume = shallowRef(1)
  const muted = shallowRef(false)
  const rate = shallowRef(1)
  const loop = shallowRef(false)
  let player: WaveSurfer | null = null
  let mounted = false
  let disposed = false
  let generation = 0

  function release() {
    player?.destroy()
    player = null
    const media = options.media.value
    if (media) {
      media.pause()
      media.removeAttribute('src')
      media.load()
    }
  }

  async function load() {
    const id = ++generation
    release()
    ready.value = false
    failed.value = false
    playbackFailed.value = false
    playing.value = false
    currentTime.value = 0
    duration.value = 0
    const container = options.container.value
    const media = options.media.value
    const src = options.src()
    const active = () => !disposed && id === generation
    const fail = (error: unknown) => {
      if (!active() || failed.value) return
      ready.value = false
      failed.value = true
      playing.value = false
      media?.pause()
      options.onError?.(error)
    }
    if (!container || !media || disposed) return
    if (!src) {
      fail(new Error('An audio source is required'))
      return
    }
    try {
      // wavesurfer 及浏览器音频 API 只在挂载后加载，SSR 不创建播放器。
      const { default: WaveSurfer } = await import('wavesurfer.js')
      if (!active()) return
      const instance = WaveSurfer.create({
        height: 'auto',
        waveColor: '#c6ddfc',
        progressColor: '#0077fa',
        cursorColor: '#0077fa',
        cursorWidth: 1,
        barWidth: 4,
        barGap: 6,
        barRadius: 4,
        normalize: true,
        ...options.waveformOptions(),
        container,
        media,
        backend: 'MediaElement',
        width: '100%',
        fillParent: true,
        hideScrollbar: true,
        interact: true,
        dragToSeek: true,
        mediaControls: false,
        autoplay: false,
      })
      player = instance
      instance.setVolume(volume.value)
      instance.setMuted(muted.value)
      instance.setPlaybackRate(rate.value)
      media.loop = loop.value
      instance.on('ready', seconds => {
        if (!active() || failed.value) return
        duration.value = seconds
        ready.value = true
        options.onReady?.(seconds)
      })
      instance.on('timeupdate', seconds => {
        if (active()) currentTime.value = seconds
      })
      instance.on('play', () => {
        if (active()) playing.value = true
      })
      instance.on('pause', () => {
        if (active()) playing.value = false
      })
      instance.on('finish', () => {
        if (active()) playing.value = false
      })
      instance.on('error', fail)
      await instance.load(src)
    } catch (error) {
      fail(error)
    }
  }

  async function togglePlayback() {
    if (!player || !ready.value) return
    const id = generation
    const instance = player
    playbackFailed.value = false
    try {
      if (instance.isPlaying()) instance.pause()
      else {
        if (currentTime.value >= duration.value) instance.setTime(0)
        await instance.play()
      }
    } catch (error) {
      if (id !== generation || disposed) return
      playbackFailed.value = true
      options.onError?.(error)
    }
  }
  function seek(seconds: number) {
    if (ready.value && Number.isFinite(seconds)) {
      const time = Math.max(0, Math.min(seconds, duration.value))
      player?.setTime(time)
      const media = options.media.value
      // wavesurfer 8 的延后定位可能被上一次 seeking 事件清除；外部媒体以最新操作为准。
      if (media && media.readyState >= media.HAVE_METADATA) media.currentTime = time
    }
  }
  function setVolume(value: number) {
    if (!Number.isFinite(value)) return
    volume.value = Math.max(0, Math.min(1, value))
    muted.value = value === 0
    player?.setVolume(volume.value)
    player?.setMuted(muted.value)
  }
  function toggleMute() {
    muted.value = !muted.value
    if (!muted.value && volume.value === 0) setVolume(1)
    player?.setMuted(muted.value)
  }
  function setRate(value: number) {
    if (!Number.isFinite(value) || value < 0.25 || value > 4) return
    rate.value = value
    player?.setPlaybackRate(value)
  }
  function setLoop(value: boolean) {
    loop.value = value
    if (options.media.value) options.media.value.loop = value
  }

  onMounted(() => {
    mounted = true
    void load()
  })
  watch(options.src, () => {
    if (mounted) void load()
  })
  watch(options.waveformOptions, value => player?.setOptions(value ?? {}), { deep: true })
  onBeforeUnmount(() => {
    disposed = true
    generation++
    release()
  })

  return {
    ready: readonly(ready),
    failed: readonly(failed),
    playbackFailed: readonly(playbackFailed),
    playing: readonly(playing),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    volume: readonly(volume),
    muted: readonly(muted),
    rate: readonly(rate),
    loop: readonly(loop),
    retry: load,
    togglePlayback,
    seek,
    setVolume,
    toggleMute,
    setRate,
    setLoop,
  }
}
