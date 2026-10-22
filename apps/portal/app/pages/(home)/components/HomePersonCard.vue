<script setup lang="ts">
import { isContentAssetUrl, type WebTeacher } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'

const props = defineProps<{ person: WebTeacher; index: number; expanded: boolean }>()
const emit = defineEmits<{ 'update:expanded': [value: boolean] }>()
const { t } = useI18n()
const apiUrl = useApiUrl()
const storyId = useId()
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')
const hasStory = computed(() => Boolean(props.person.story?.trim()))

function enter(event: PointerEvent) {
  if (event.pointerType === 'mouse' && hasStory.value) emit('update:expanded', true)
}
function leave(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  const card = event.currentTarget as HTMLElement
  if (!card.contains(document.activeElement)) emit('update:expanded', false)
}
function blur(event: FocusEvent) {
  const card = event.currentTarget as HTMLElement
  if (!(event.relatedTarget instanceof Node) || !card.contains(event.relatedTarget))
    emit('update:expanded', false)
}
async function open() {
  emit('update:expanded', true)
  await nextTick()
  closeButton.value?.focus({ preventScroll: true })
}
async function close(restoreFocus = false) {
  emit('update:expanded', false)
  if (restoreFocus) {
    await nextTick()
    trigger.value?.focus({ preventScroll: true })
  }
}
</script>

<template>
  <article
    class="home-people__card"
    @pointerenter="enter"
    @pointerleave="leave"
    @focusout="blur"
    @keydown.esc.stop.prevent="close(true)"
  >
    <div class="home-people__quote" :aria-hidden="expanded || undefined">
      <img :src="`/home/figma/${index === 2 ? '3f802.svg' : '5f87f.svg'}`" alt="" />
      <p v-if="hasStory" :aria-label="t('home.teacherStory')">{{ person.story }}</p>
    </div>
    <span class="home-people__divider" aria-hidden="true" />
    <span class="home-people__who" :aria-hidden="expanded || undefined">
      <img
        v-if="isContentAssetUrl(apiUrl(person.avatarUrl))"
        :src="apiUrl(person.avatarUrl)"
        alt=""
      />
      <i v-else aria-hidden="true" />
      <span>
        <strong>{{ person.name }}</strong>
        <em v-if="person.jobTitle" :title="person.jobTitle">{{ person.jobTitle }}</em>
        <small>{{ person.schoolOrg }}</small>
      </span>
    </span>
    <button
      v-if="hasStory"
      ref="trigger"
      class="home-people__story-trigger"
      type="button"
      :aria-label="`${person.name} · ${t('home.viewStory')}`"
      :aria-expanded="expanded"
      :aria-controls="storyId"
      :tabindex="expanded ? -1 : 0"
      @click="open"
    />
    <Transition name="teacher-story">
      <div
        v-if="expanded && hasStory"
        :id="storyId"
        class="home-people__story swiper-no-swiping"
        role="region"
        :aria-label="`${person.name} · ${t('home.teacherStory')}`"
        @keydown.left.stop
        @keydown.right.stop
      >
        <button
          ref="closeButton"
          class="home-people__story-close"
          type="button"
          :aria-label="t('home.closeStory')"
          @click="close($event.detail === 0)"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <div class="home-people__story-body" tabindex="0">{{ person.story }}</div>
      </div>
    </Transition>
  </article>
</template>

<style lang="scss" scoped>
.home-people {
  &__card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    height: 100%;
    display: grid;
    min-height: 236px;
    grid-template-rows: 1fr 1px 48px;
    row-gap: 24px;
    padding: 24px;
    border-radius: 12px;
    background: #edf3ff;
    color: var(--ic-color-academy-text-primary);
  }

  p {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    margin: 0;
    font-size: 14px;
    line-height: 22px;
  }

  &__quote {
    display: grid;
    align-content: start;
    gap: 12px;

    img {
      width: auto;
      height: auto;
      border-radius: 0;
      background: none;
    }
  }

  &__divider {
    display: block;
    border-top: 1px solid var(--ic-color-academy-border-base);
  }

  &__who {
    display: flex;
    align-items: center;
    gap: 16px;

    > span {
      display: grid;
      min-width: 0;
      flex: 1;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 6px 12px;
    }

    & img,
    & i {
      width: 48px;
      height: 48px;
      flex: none;
      border-radius: 50%;
      background: var(--ic-color-academy-text-muted);
      object-fit: cover;
    }
  }

  strong {
    display: inline;
    min-width: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    display: block;
    overflow: hidden;
    grid-column: 1 / -1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    display: inline-block;
    overflow: hidden;
    max-width: 100%;
    justify-self: start;
    margin: 0;
    padding: 2px 8px;
    border-radius: 3px;
    background: rgb(0 149 238 / 15%);
    color: #004b83;
    font-size: 12px;
    font-style: normal;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--ic-color-academy-text-muted);
    font-size: 12px;
  }
}

@media (max-width: 767px) {
  .home-people {
    &__card {
      min-height: 228px;
      grid-template-rows: 1fr 1px 72px;
      row-gap: 16px;
      padding: 20px;
    }

    &__quote p {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }

    &__who {
      gap: 12px;

      > span {
        grid-template-columns: minmax(0, 1fr);
        row-gap: 0;
      }

      img,
      i {
        width: 40px;
        height: 40px;
      }
    }

    strong {
      display: block;
      font-size: 15px;
      line-height: 22px;
    }

    em {
      margin: 4px 0;
      font-size: 11px;
    }
  }
}

.home-people {
  &__story-trigger {
    position: absolute;
    z-index: 1;
    inset: 0;
    padding: 0;
    border: 0;
    border-radius: inherit;
    background: transparent;
    color: var(--ic-color-academy-primary);
    cursor: pointer;

    &:focus-visible {
      outline-offset: -3px;
    }
  }

  &__story {
    position: absolute;
    z-index: 2;
    inset: 0;
    display: flex;
    min-height: 0;
    flex-direction: column;
    padding: 24px;
    border-radius: inherit;
    background: var(--ic-color-academy-text-primary);
    color: var(--ic-color-text-inverse);
  }

  &__story-close {
    position: absolute;
    z-index: 1;
    top: 4px;
    right: 4px;
    display: grid;
    width: 44px;
    height: 44px;
    flex: none;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: 6px;
    background: rgb(255 255 255 / 15%);
    color: inherit;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;

    svg {
      width: 18px;
      height: 18px;
      stroke: currentcolor;
      stroke-width: 1.8;
      stroke-linecap: round;
    }

    &:focus-visible {
      outline-color: currentcolor;
      outline-offset: -3px;
      opacity: 1;
      pointer-events: auto;
    }
  }

  &__story-body {
    --story-scrollbar-thumb: rgb(255 255 255 / 32%);

    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--story-scrollbar-thumb) transparent;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 14px;
    line-height: 22px;
    touch-action: pan-y;

    &:hover,
    &:focus-within {
      --story-scrollbar-thumb: rgb(255 255 255 / 50%);
    }

    @supports not (scrollbar-width: thin) {
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: var(--story-scrollbar-thumb);
      }
    }

    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: -2px;
    }
  }
}

.teacher-story-enter-active,
.teacher-story-leave-active {
  transition: opacity var(--ic-motion-duration-fast, 150ms) ease;
}

.teacher-story-enter-from,
.teacher-story-leave-to {
  opacity: 0;
}

.teacher-story-leave-active {
  pointer-events: none;
}

@media (max-width: 767px) {
  .home-people {
    &__story {
      padding: 20px;
    }
  }
}

@media (hover: none), (pointer: coarse) {
  .home-people__story-close {
    opacity: 1;
    pointer-events: auto;
  }

  .home-people__story-body {
    padding-top: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .teacher-story-enter-active,
  .teacher-story-leave-active {
    transition: none;
  }
}
</style>
