<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, shallowRef, useId, useTemplateRef } from 'vue'

const props = defineProps<{ value: number; label: string }>()
const emit = defineEmits<{ change: [value: number] }>()
const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
const expanded = shallowRef(false)
const active = shallowRef(0)
const root = useTemplateRef<HTMLDivElement>('root')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const listId = useId()

function close(restoreFocus = false) {
  expanded.value = false
  if (restoreFocus) trigger.value?.focus()
}
function choose(index: number) {
  const speed = speeds[index]
  if (speed === undefined) return
  emit('change', speed)
  close(true)
}
function open(index = speeds.indexOf(props.value)) {
  active.value = Math.max(0, index)
  expanded.value = true
  scrollActiveIntoView()
}
function scrollActiveIntoView() {
  void nextTick(() => {
    root.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  })
}
function keydown(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    close()
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return
  event.preventDefault()
  if (!expanded.value) {
    open(event.key === 'Home' ? 0 : event.key === 'End' ? speeds.length - 1 : undefined)
    return
  }
  if (event.key === 'Enter' || event.key === ' ') choose(active.value)
  else if (event.key === 'Home') active.value = 0
  else if (event.key === 'End') active.value = speeds.length - 1
  else
    active.value =
      (active.value + (event.key === 'ArrowDown' ? 1 : -1) + speeds.length) % speeds.length
  scrollActiveIntoView()
}
function dismiss(event: Event) {
  if (event.target instanceof Node && !root.value?.contains(event.target)) close()
}
onMounted(() => {
  document.addEventListener('pointerdown', dismiss)
  document.addEventListener('focusin', dismiss)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', dismiss)
  document.removeEventListener('focusin', dismiss)
})
</script>

<template>
  <div ref="root" class="ui-audio-speed-select">
    <button
      ref="trigger"
      type="button"
      class="ui-audio-speed-select__trigger"
      role="combobox"
      aria-haspopup="listbox"
      :aria-label="label"
      :aria-expanded="expanded"
      :aria-controls="listId"
      :aria-activedescendant="expanded ? `${listId}-${active}` : undefined"
      @keydown="keydown"
      @click="expanded ? close() : open()"
    >
      <span>{{ value }}×</span>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
      </svg>
    </button>
    <div
      v-if="expanded"
      :id="listId"
      class="ui-audio-speed-select__popup"
      role="listbox"
      :aria-label="label"
    >
      <p class="ui-audio-speed-select__title" role="presentation">{{ label }}</p>
      <div
        v-for="(speed, index) in speeds"
        :id="`${listId}-${index}`"
        :key="speed"
        class="ui-audio-speed-select__option"
        role="option"
        :aria-selected="value === speed"
        :data-active="active === index"
        @pointermove="active = index"
        @pointerdown.prevent
        @click="choose(index)"
      >
        <span>{{ speed }}×</span>
        <svg v-if="value === speed" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="m3.5 8 3 3 6-6" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ui-audio-speed-select {
  position: relative;
  flex: none;
  width: 72px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;

  svg {
    flex: none;
    width: 16px;
    height: 16px;
    stroke: currentcolor;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    width: 100%;
    height: 36px;
    padding: 0 8px 0 10px;
    border: 0;
    border-radius: 10px;
    background: #fff;
    color: inherit;
    font: inherit;
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid var(--audio-primary, #0077fa);
      outline-offset: 3px;
    }

    svg {
      color: #94a3b8;
      transition: transform 160ms ease;
    }

    &[aria-expanded='true'] svg {
      transform: rotate(180deg);
    }
  }

  &__popup {
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    bottom: calc(100% + 12px);
    z-index: 2;
    transform: translateX(-50%);
    width: 144px;
    max-height: min(320px, 60vh);
    overflow-y: auto;
    padding: 6px;
    border: 0;
    border-radius: 14px;
    background: #fff;
    color: #475569;
    box-shadow:
      0 12px 32px -8px rgb(15 23 42 / 18%),
      0 2px 6px rgb(15 23 42 / 4%);
  }

  &__title {
    margin: 0;
    padding: 8px 10px 5px;
    color: #94a3b8;
    font-size: 11px;
    line-height: 16px;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 36px;
    padding-inline: 10px;
    border-radius: 8px;
    line-height: 20px;
    cursor: pointer;

    &[data-active='true'] {
      background: #f4f6f9;
    }

    &[aria-selected='true'] {
      color: var(--audio-primary, #0077fa);
      font-weight: 600;
    }
  }
}

@container (max-width: 700px) {
  .ui-audio-speed-select__popup {
    max-height: 160px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-audio-speed-select__trigger svg {
    transition: none;
  }
}
</style>
