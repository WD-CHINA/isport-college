import type { WaveSurferOptions } from 'wavesurfer.js'

export type AudioWaveformOptions = Pick<
  WaveSurferOptions,
  | 'height'
  | 'waveColor'
  | 'progressColor'
  | 'cursorColor'
  | 'cursorWidth'
  | 'barWidth'
  | 'barGap'
  | 'barRadius'
  | 'normalize'
>

export interface AudioPlayerLabels {
  play: string
  pause: string
  seek: string
  mute: string
  unmute: string
  volume: string
  speed: string
  more: string
  restart: string
  loop: string
  loading: string
  failed: string
  playbackFailed: string
  retry: string
}

export const defaultAudioPlayerLabels: AudioPlayerLabels = {
  play: 'Play',
  pause: 'Pause',
  seek: 'Playback position',
  mute: 'Mute',
  unmute: 'Unmute',
  volume: 'Volume',
  speed: 'Playback speed',
  more: 'More audio controls',
  restart: 'Restart',
  loop: 'Loop audio',
  loading: 'Loading audio…',
  failed: 'Unable to load audio. Check the file and retry.',
  playbackFailed: 'Unable to play audio. Please try again.',
  retry: 'Retry',
}

export function formatAudioTime(value: number) {
  const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = String(seconds % 60).padStart(2, '0')
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`
}
