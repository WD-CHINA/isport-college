<script setup lang="ts">
import type { MediaAsset } from '@isport/shared'

const props = defineProps<{ images: MediaAsset[]; title: string }>()
const emit = defineEmits<{ error: [] }>()
const { t } = useI18n()
const selected = shallowRef(0)
const thumbnails = useTemplateRef<HTMLElement>('thumbnails')
const current = computed(() => props.images[selected.value])
watch(
  () => props.images.map(item => item.url).join('\n'),
  () => {
    selected.value = 0
  },
)
async function select(index: number) {
  if (!props.images.length) return
  selected.value = (index + props.images.length) % props.images.length
  await nextTick()
  const active = thumbnails.value?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
  if (active && thumbnails.value) {
    thumbnails.value.scrollTo({
      left: Math.max(
        0,
        active.offsetLeft - thumbnails.value.clientWidth / 2 + active.clientWidth / 2,
      ),
      behavior: 'auto',
    })
  }
}
</script>

<template>
  <section
    class="resource-gallery"
    data-testid="image-carousel"
    :aria-label="title"
    tabindex="0"
    @keydown.left.prevent="select(selected - 1)"
    @keydown.right.prevent="select(selected + 1)"
  >
    <div class="resource-gallery__stage">
      <img
        v-if="current"
        class="resource-gallery__image"
        :src="current.url"
        :alt="title"
        draggable="false"
        @error="emit('error')"
      />
      <span class="resource-gallery__counter" role="status"
        >{{ selected + 1 }} / {{ images.length }}</span
      >
      <template v-if="images.length > 1">
        <button
          class="resource-gallery__arrow resource-gallery__arrow--previous"
          type="button"
          :aria-label="t('media.previousImage')"
          @click="select(selected - 1)"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12 5-5 5 5 5" /></svg>
        </button>
        <button
          class="resource-gallery__arrow resource-gallery__arrow--next"
          type="button"
          :aria-label="t('media.nextImage')"
          @click="select(selected + 1)"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
        </button>
      </template>
    </div>
    <div
      ref="thumbnails"
      class="resource-gallery__thumbnails"
      :aria-label="t('media.imageThumbnails')"
    >
      <button
        v-for="(item, index) in images"
        :key="`${item.url}-${index}`"
        class="image-zoom"
        type="button"
        :aria-pressed="selected === index"
        :aria-label="t('media.viewImage', { index: index + 1 })"
        @click="select(index)"
      >
        <img
          class="image-zoom__image"
          :src="item.url"
          alt=""
          loading="lazy"
          @error="emit('error')"
        />
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.resource-gallery {
  min-width: 0;
  overflow: hidden;
  border-radius: var(--ic-border-radius-lg);
  background: var(--ic-color-background-container);
  box-shadow: inset 0 0 0 1px var(--ic-color-academy-border-panel);

  &:focus-visible {
    outline: 2px solid var(--ic-color-academy-primary);
    outline-offset: 3px;
  }

  &__stage {
    position: relative;
    display: grid;
    height: 350px;
    place-items: center;
    background: var(--ic-color-academy-background-section);
  }

  &__image {
    display: block;
    width: 100%;
    height: 100%;
    min-height: 0;
    object-fit: contain;
  }

  &__counter {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 4px 14px;
    border-radius: var(--ic-border-radius-full);
    background: var(--ic-color-academy-overlay-control);
    color: var(--ic-color-text-inverse);
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
  }

  &__arrow {
    position: absolute;
    top: 50%;
    display: grid;
    width: 40px;
    height: 40px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: var(--ic-border-radius-full);
    background: var(--ic-color-academy-overlay-control);
    color: var(--ic-color-text-inverse);
    cursor: pointer;
    transform: translateY(-50%);
  }

  &__arrow--previous {
    left: 16px;
  }

  &__arrow--next {
    right: 16px;
  }

  &__arrow svg {
    width: 20px;
    height: 20px;
    stroke: currentcolor;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &__thumbnails {
    position: relative;
    display: flex;
    min-width: 0;
    min-height: 100px;
    align-items: center;
    justify-content: safe center;
    gap: 10px;
    overflow-x: auto;
    padding: 16px;
    scrollbar-width: thin;
  }

  &__thumbnails button {
    width: 84px;
    height: 48px;
    flex: 0 0 84px;
    overflow: hidden;
    padding: 0;
    border: 2px solid transparent;
    border-radius: 6px;
    background: var(--ic-color-academy-background-section);
    cursor: pointer;
  }

  &__thumbnails button[aria-pressed='true'] {
    border-color: var(--ic-color-academy-primary);
  }

  &__thumbnails img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button:focus-visible {
    outline: 2px solid var(--ic-color-academy-primary);
    outline-offset: 3px;
  }
}

@media (max-width: 767px) {
  .resource-gallery {
    &__stage {
      height: auto;

      &::before {
        display: block;
        width: 100%;
        padding-top: 56.25%;
        content: '';
      }
    }

    &__image {
      position: absolute;
      inset: 0;
    }

    &__thumbnails {
      min-height: 80px;
      justify-content: flex-start;
      padding: 12px;
    }

    &__arrow {
      width: 36px;
      height: 36px;
    }

    &__arrow--previous {
      left: 10px;
    }

    &__arrow--next {
      right: 10px;
    }
  }
}
</style>
