<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { useWaveSurfer } from '../audio/useWaveSurfer'
import { defaultAudioPlayerLabels, formatAudioTime } from '../audio/types'
import type { AudioPlayerLabels, AudioWaveformOptions } from '../audio/types'
import UiAudioSpeedSelect from './UiAudioSpeedSelect.vue'

const props = defineProps<{
  src: string
  title?: string
  labels?: Partial<AudioPlayerLabels>
  waveformOptions?: AudioWaveformOptions
}>()
const emit = defineEmits<{ ready: [duration: number]; error: [error: unknown] }>()
const labels = computed(() => ({ ...defaultAudioPlayerLabels, ...props.labels }))
const waveform = useTemplateRef<HTMLDivElement>('waveform')
const media = useTemplateRef<HTMLAudioElement>('media')
const moreMenu = useTemplateRef<HTMLDetailsElement>('moreMenu')
const {
  ready,
  failed,
  playbackFailed,
  playing,
  currentTime,
  duration,
  volume,
  muted,
  rate,
  loop,
  retry,
  togglePlayback,
  seek,
  setVolume,
  toggleMute,
  setRate,
  setLoop,
} = useWaveSurfer({
  src: () => props.src,
  container: waveform,
  media,
  waveformOptions: () => props.waveformOptions,
  onReady: seconds => emit('ready', seconds),
  onError: error => emit('error', error),
})
const progress = computed(() => (duration.value ? (currentTime.value / duration.value) * 100 : 0))
const volumePercent = computed(() => Math.round((muted.value ? 0 : volume.value) * 100))
function rangeValue(event: Event) {
  return Number((event.target as HTMLInputElement).value)
}
function closeMore(restoreFocus = false) {
  if (!moreMenu.value?.open) return
  moreMenu.value.open = false
  if (restoreFocus) moreMenu.value.querySelector('summary')?.focus()
}
function restart() {
  seek(0)
  closeMore(true)
}
function dismissMore(event: PointerEvent) {
  if (event.target instanceof Node && !moreMenu.value?.contains(event.target)) closeMore()
}
onMounted(() => document.addEventListener('pointerdown', dismissMore))
onBeforeUnmount(() => document.removeEventListener('pointerdown', dismissMore))
</script>

<template>
  <section class="ui-audio-player" :aria-label="title" :aria-busy="!ready && !failed">
    <audio ref="media" preload="metadata" :aria-label="title" />
    <div class="ui-audio-player__stage">
      <div
        ref="waveform"
        class="ui-audio-player__waveform"
        :class="{ 'is-hidden': !ready }"
        aria-hidden="true"
      />
      <p v-if="!ready && !failed" class="ui-audio-player__status" role="status">
        {{ labels.loading }}
      </p>
      <div v-if="failed" class="ui-audio-player__status" role="alert">
        <p>{{ labels.failed }}</p>
        <button type="button" class="ui-audio-player__retry" @click="retry">
          {{ labels.retry }}
        </button>
      </div>
    </div>
    <p v-if="playbackFailed" class="ui-audio-player__notice" role="alert">
      {{ labels.playbackFailed }}
    </p>
    <div class="ui-audio-player__controls">
      <button
        type="button"
        class="ui-audio-player__play"
        :aria-label="playing ? labels.pause : labels.play"
        :disabled="!ready"
        @click="togglePlayback"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path v-if="playing" d="M7 5h4v14H7zm6 0h4v14h-4z" />
          <path
            v-else
            d="M8 5.5a1 1 0 0 1 1.5-.86l10 6a1.5 1.5 0 0 1 0 2.58l-10 6A1 1 0 0 1 8 18.36z"
          />
        </svg>
      </button>
      <span class="ui-audio-player__time"
        >{{ formatAudioTime(currentTime) }} / {{ formatAudioTime(duration) }}</span
      >
      <input
        class="ui-audio-player__seek"
        type="range"
        min="0"
        :max="duration || 1"
        step="0.01"
        :value="currentTime"
        :disabled="!ready"
        :aria-label="labels.seek"
        :aria-valuetext="`${formatAudioTime(currentTime)} / ${formatAudioTime(duration)}`"
        :style="{ '--audio-progress': `${progress}%` }"
        @input="seek(rangeValue($event))"
        @keydown.home.prevent="seek(0)"
        @keydown.end.prevent="seek(duration)"
        @keydown.left.prevent="seek(currentTime - 5)"
        @keydown.right.prevent="seek(currentTime + 5)"
      />
      <div
        class="ui-audio-player__volume"
        :class="{ 'is-muted': muted || !volume }"
        :style="{ '--audio-volume': `${volumePercent}%` }"
      >
        <button
          type="button"
          class="ui-audio-player__icon"
          :aria-label="muted || !volume ? labels.unmute : labels.mute"
          :aria-pressed="muted || !volume"
          :title="muted || !volume ? labels.unmute : labels.mute"
          @click="toggleMute"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M11 4 5 9H2v6h3l6 5z" />
            <path v-if="muted || !volume" d="m16 9 6 6m0-6-6 6" />
            <path v-else d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
          </svg>
        </button>
        <input
          class="ui-audio-player__volume-range"
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="muted ? 0 : volume"
          :aria-label="labels.volume"
          @input="setVolume(rangeValue($event))"
          @keydown.home.prevent="setVolume(0)"
          @keydown.end.prevent="setVolume(1)"
        />
        <span class="ui-audio-player__volume-value" aria-hidden="true">{{ volumePercent }}%</span>
      </div>
      <UiAudioSpeedSelect
        class="ui-audio-player__speed"
        :value="rate"
        :label="labels.speed"
        @change="setRate"
      />
      <details
        ref="moreMenu"
        class="ui-audio-player__more"
        @keydown.esc.stop.prevent="closeMore(true)"
      >
        <summary :aria-label="labels.more" :title="labels.more">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </summary>
        <div class="ui-audio-player__menu">
          <p class="ui-audio-player__menu-title">{{ labels.more }}</p>
          <button
            type="button"
            class="ui-audio-player__menu-item"
            :disabled="!ready"
            @click="restart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
              <path d="M12 8v5l3 2" />
            </svg>
            <span>{{ labels.restart }}</span>
          </button>
          <label class="ui-audio-player__menu-item" :class="{ 'is-active': loop }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path
                d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"
              />
            </svg>
            <span>{{ labels.loop }}</span>
            <input
              class="ui-audio-player__toggle"
              type="checkbox"
              :checked="loop"
              @change="setLoop(($event.target as HTMLInputElement).checked)"
            />
          </label>
        </div>
      </details>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.ui-audio-player {
  --audio-primary: var(--ic-color-academy-primary, #0077fa);
  --audio-muted: var(--ic-color-text-secondary, #64748b);

  position: relative;
  box-sizing: border-box;
  display: grid;
  container-type: inline-size;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto;
  width: 100%;
  min-width: 0;
  border-radius: 16px;
  background: #eff6ff;
  color: var(--audio-muted);
  font-family: inherit;

  &::before {
    grid-area: 1 / 1 / 3 / 2;
    padding-top: 56.25%;
    content: '';
  }

  audio {
    display: none;
  }

  &__stage {
    position: relative;
    z-index: 0;
    display: grid;
    grid-area: 1 / 1;
    align-items: center;
    min-width: 0;
    min-height: 160px;
    margin: clamp(16px, 3%, 48px) clamp(16px, 3%, 48px) 0;
    padding: 24px 6%;
  }

  &__waveform {
    width: 100%;
    height: clamp(100px, 19cqw, 300px);
    min-width: 0;

    &.is-hidden {
      visibility: hidden;
    }
  }

  &__status {
    position: absolute;
    inset: 0;
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 12px;
    padding: 16px;
    margin: 0;
    text-align: center;

    p {
      margin: 0;
    }
  }

  button,
  input,
  select,
  summary {
    font: inherit;
  }

  button,
  summary,
  select {
    cursor: pointer;
  }

  button:disabled,
  input:disabled {
    cursor: wait;
    opacity: 0.5;
  }

  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--audio-primary);
    outline-offset: 3px;
  }

  svg {
    display: block;
    width: 24px;
    height: 24px;
    flex: none;
  }

  &__controls {
    position: relative;
    z-index: 1;
    display: flex;
    grid-area: 2 / 1;
    align-items: center;
    gap: 16px;
    min-width: 0;
    margin: 0 clamp(16px, 3%, 48px) clamp(16px, 3%, 48px);
    padding: 14px 20px;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    background: #fff;
  }

  &__play {
    display: grid;
    place-items: center;
    flex: none;
    width: 44px;
    height: 44px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--audio-primary);
    color: #fff;
  }

  &__time {
    flex: none;
    white-space: nowrap;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }

  &__seek {
    width: 100%;
    min-width: 60px;
    height: 6px;
    flex: 1;
    margin: 0;
    appearance: none;
    border-radius: 6px;
    background: linear-gradient(
      to right,
      var(--audio-primary) var(--audio-progress),
      #dce7f5 var(--audio-progress)
    );

    &::-webkit-slider-thumb {
      width: 14px;
      height: 14px;
      appearance: none;
      border-radius: 50%;
      background: var(--audio-primary);
    }

    &::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border: 0;
      border-radius: 50%;
      background: var(--audio-primary);
    }
  }

  &__volume {
    box-sizing: border-box;
    display: flex;
    flex: none;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 10px 0 4px;
    transition:
      border-color 160ms ease,
      background-color 160ms ease;

    .ui-audio-player__icon {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      color: var(--audio-primary);
      transition:
        background-color 160ms ease,
        color 160ms ease;

      &:hover {
        background: #e0edff;
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    &.is-muted .ui-audio-player__icon {
      color: var(--audio-muted);
    }
  }

  &__volume-range {
    width: 64px;
    height: 24px;
    margin: 0;
    appearance: none;
    background: transparent;
    cursor: pointer;

    &::-webkit-slider-runnable-track {
      height: 4px;
      border-radius: 4px;
      background: linear-gradient(
        to right,
        var(--audio-primary) var(--audio-volume),
        #d9e4f2 var(--audio-volume)
      );
    }

    &::-moz-range-track {
      height: 4px;
      border-radius: 4px;
      background: linear-gradient(
        to right,
        var(--audio-primary) var(--audio-volume),
        #d9e4f2 var(--audio-volume)
      );
    }

    &::-webkit-slider-thumb {
      width: 12px;
      height: 12px;
      margin-top: -4px;
      appearance: none;
      border: 2px solid #fff;
      border-radius: 50%;
      background: var(--audio-primary);
      box-shadow: 0 1px 4px rgb(0 119 250 / 28%);
      transition: box-shadow 160ms ease;
    }

    &::-moz-range-thumb {
      width: 8px;
      height: 8px;
      border: 2px solid #fff;
      border-radius: 50%;
      background: var(--audio-primary);
      box-shadow: 0 1px 4px rgb(0 119 250 / 28%);
    }

    &:hover::-webkit-slider-thumb,
    &:focus-visible::-webkit-slider-thumb {
      box-shadow: 0 0 0 4px rgb(0 119 250 / 12%);
    }
  }

  &__volume-value {
    width: 32px;
    color: #64748b;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    text-align: end;
  }

  &__icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 36px;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;

    svg {
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  }

  &__more {
    position: relative;
    flex: none;

    summary {
      box-sizing: border-box;
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      color: var(--audio-muted);
      list-style: none;
      transition:
        background-color 160ms ease,
        color 160ms ease,
        border-color 160ms ease;

      &:hover {
        color: var(--audio-primary);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }

    &[open] summary {
      border-color: #c8ddf9;
      background: #e7f1ff;
      color: var(--audio-primary);
    }

    summary::-webkit-details-marker {
      display: none;
    }
  }

  &__menu {
    box-sizing: border-box;
    position: absolute;
    right: 0;
    bottom: calc(100% + 12px);
    z-index: 1;
    display: grid;
    gap: 4px;
    width: 204px;
    max-width: calc(100vw - 48px);
    padding: 6px;
    border: 1px solid #e2eaf4;
    border-radius: 14px;
    background: #fff;
    font-size: 13px;
    box-shadow:
      0 12px 32px -8px rgb(15 23 42 / 18%),
      0 2px 6px rgb(15 23 42 / 4%);

    &::after {
      position: absolute;
      right: 12px;
      bottom: -5px;
      width: 8px;
      height: 8px;
      transform: rotate(45deg);
      border-right: 1px solid #e2eaf4;
      border-bottom: 1px solid #e2eaf4;
      background: #fff;
      content: '';
    }
  }

  &__menu-title {
    margin: 0;
    padding: 8px 10px 5px;
    color: #94a3b8;
    font-size: 11px;
    line-height: 16px;
  }

  &__menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
    padding: 8px 10px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #475569;
    font-size: 13px;
    line-height: 20px;
    text-align: start;
    cursor: pointer;
    transition:
      background-color 160ms ease,
      color 160ms ease;

    svg {
      width: 18px;
      height: 18px;
      stroke-width: 1.7;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    > span {
      flex: 1;
    }

    &:not(:disabled):hover,
    &:focus-within {
      background: #f0f6ff;
      color: var(--audio-primary);
    }

    &.is-active {
      background: #f0f6ff;
      color: var(--audio-primary);
    }
  }

  &__toggle {
    position: relative;
    flex: none;
    width: 30px;
    height: 18px;
    margin: 0;
    appearance: none;
    border: 0;
    border-radius: 18px;
    background: #d7e2ef;
    cursor: pointer;
    transition: background-color 160ms ease;

    &::before {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgb(15 23 42 / 15%);
      content: '';
      transition: transform 160ms ease;
    }

    &:checked {
      background: var(--audio-primary);

      &::before {
        transform: translateX(12px);
      }
    }
  }

  &__retry {
    padding: 8px 16px;
    border: 0;
    border-radius: 8px;
    background: var(--audio-primary);
    color: #fff;
  }

  &__notice {
    position: absolute;
    left: 24px;
    bottom: 94px;
    right: 24px;
    margin: 0;
    color: #b91c1c;
    text-align: center;
  }
}

@container (max-width: 700px) {
  .ui-audio-player {
    &__controls {
      flex-wrap: wrap;
      gap: 12px;
      padding: 12px;
    }

    &__play {
      width: 40px;
      height: 40px;
    }

    &__seek {
      order: 1;
      flex-basis: 100%;
      margin-block: 6px;
    }

    &__time {
      flex: 1;
      font-size: 12px;
    }

    &__volume {
      gap: 4px;
      height: 36px;
      padding-inline-end: 8px;

      input {
        width: 40px;
      }
    }

    &__volume-value {
      display: none;
    }

    &__notice {
      bottom: 124px;
    }

    &__more {
      margin-inline-start: auto;
    }
  }
}

@container (max-width: 360px) {
  .ui-audio-player {
    &__controls {
      gap: 6px;
    }

    &__volume input {
      width: 32px;
    }

    &__speed {
      width: 64px;
      font-size: 12px;
    }

    &__more summary {
      width: 30px;
      height: 34px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-audio-player {
    &__volume,
    &__icon,
    &__more summary,
    &__menu-item,
    &__toggle,
    &__toggle::before {
      transition: none;
    }
  }
}
</style>
