// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, shallowRef } from 'vue'
import type { App } from 'vue'
import { useWaveSurfer } from '../src/audio/useWaveSurfer'
import { formatAudioTime } from '../src/audio/types'

const factory = vi.hoisted(() => ({ create: vi.fn() }))
vi.mock('wavesurfer.js', () => ({ default: { create: factory.create } }))

class FakeWave {
  listeners = new Map<string, ((value: unknown) => void)[]>()
  load = vi.fn((): Promise<void> => Promise.resolve())
  destroy = vi.fn()
  setOptions = vi.fn()
  setVolume = vi.fn()
  setMuted = vi.fn()
  setPlaybackRate = vi.fn()
  isPlaying = vi.fn(() => false)
  setTime = vi.fn((time: number) => this.emit('timeupdate', time))
  pause = vi.fn(() => this.emit('pause'))
  play = vi.fn(() => {
    this.emit('play')
    return Promise.resolve()
  })
  on(event: string, listener: (value: unknown) => void) {
    this.listeners.set(event, [...(this.listeners.get(event) ?? []), listener])
  }
  emit(event: string, value?: unknown) {
    for (const listener of this.listeners.get(event) ?? []) listener(value)
  }
}

let app: App | undefined
let root: HTMLDivElement
let players: FakeWave[]

function mount() {
  const src = shallowRef('/first.wav')
  const container = shallowRef<HTMLElement | null>(null)
  const media = shallowRef<HTMLAudioElement | null>(null)
  const onError = vi.fn()
  let state!: ReturnType<typeof useWaveSurfer>
  app = createApp({
    setup() {
      state = useWaveSurfer({
        src: () => src.value,
        container,
        media,
        waveformOptions: () => undefined,
        onError,
      })
      return () => h('div', [h('div', { ref: container }), h('audio', { ref: media })])
    },
  })
  app.mount(root)
  return { src, state, onError, media }
}
async function settle() {
  await nextTick()
  await vi.dynamicImportSettled()
  await nextTick()
}

beforeEach(() => {
  root = document.createElement('div')
  document.body.append(root)
  players = []
  factory.create.mockReset().mockImplementation(() => {
    const player = new FakeWave()
    players.push(player)
    return player
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
})
afterEach(() => {
  app?.unmount()
  app = undefined
  root.remove()
  vi.restoreAllMocks()
})

describe('audio lifecycle', () => {
  it('destroys the old source and ignores its late load failure and events', async () => {
    let reject!: (error: Error) => void
    const pending = new Promise<void>((_resolve, fail) => {
      reject = fail
    })
    factory.create.mockImplementationOnce(() => {
      const player = new FakeWave()
      player.load.mockReturnValue(pending)
      players.push(player)
      return player
    })
    const { src, state, onError } = mount()
    await settle()
    const old = players[0]!
    src.value = '/second.wav'
    await settle()
    expect(old.destroy).toHaveBeenCalledOnce()
    expect(players[1]!.load).toHaveBeenCalledWith('/second.wav')
    old.emit('ready', 999)
    old.emit('error', new Error('obsolete'))
    reject(new Error('aborted old request'))
    await settle()
    expect(state.failed.value).toBe(false)
    expect(state.duration.value).toBe(0)
    expect(onError).not.toHaveBeenCalled()
    players[1]!.emit('ready', 90)
    expect(state.duration.value).toBe(90)
    expect(state.ready.value).toBe(true)
  })

  it('does not create a late instance after unmount and releases active media', async () => {
    mount()
    app!.unmount()
    app = undefined
    await settle()
    expect(factory.create).not.toHaveBeenCalled()
    const { media } = mount()
    await settle()
    media.value!.src = '/playing.wav'
    const element = media.value!
    app!.unmount()
    app = undefined
    expect(players[0]!.destroy).toHaveBeenCalledOnce()
    expect(element.hasAttribute('src')).toBe(false)
    expect(element.pause).toHaveBeenCalled()
  })

  it('retries failed loading, bounds seeking, and recovers from a rejected play', async () => {
    const { state, onError, media } = mount()
    await settle()
    players[0]!.emit('error', new Error('bad audio'))
    expect(state.failed.value).toBe(true)
    await state.retry()
    const player = players[1]!
    expect(players[0]!.destroy).toHaveBeenCalledOnce()
    player.emit('ready', 120)
    expect(state.failed.value).toBe(false)
    state.seek(1000)
    expect(player.setTime).toHaveBeenLastCalledWith(120)
    Object.defineProperties(media.value!, {
      readyState: { value: 1, configurable: true },
      HAVE_METADATA: { value: 1, configurable: true },
    })
    state.seek(60)
    expect(media.value!.currentTime).toBe(60)
    state.seek(0)
    expect(media.value!.currentTime).toBe(0)
    player.play.mockRejectedValueOnce(new Error('blocked playback'))
    await state.togglePlayback()
    expect(state.playbackFailed.value).toBe(true)
    expect(state.ready.value).toBe(true)
    await state.togglePlayback()
    expect(state.playbackFailed.value).toBe(false)
    expect(state.playing.value).toBe(true)
    expect(player.setTime).toHaveBeenLastCalledWith(0)
    state.setVolume(0)
    expect(player.setMuted).toHaveBeenLastCalledWith(true)
    state.toggleMute()
    expect(player.setVolume).toHaveBeenLastCalledWith(1)
    expect(player.setMuted).toHaveBeenLastCalledWith(false)
    state.setRate(1.5)
    expect(player.setPlaybackRate).toHaveBeenLastCalledWith(1.5)
    expect(onError).toHaveBeenCalledTimes(2)
  })
})

it('formats unknown, negative and hour-long durations', () => {
  expect([NaN, Infinity, -1, 65.9, 3601].map(formatAudioTime)).toEqual([
    '0:00',
    '0:00',
    '0:00',
    '1:05',
    '1:00:01',
  ])
})
