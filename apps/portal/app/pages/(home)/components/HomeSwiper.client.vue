<script setup lang="ts">
import type { SwiperContainer } from 'swiper/element'
import type { Swiper, SwiperOptions } from 'swiper/types'

const props = defineProps<{
  count: number
  label: string
  desktopSlides: number
  desktopGap: number
  peek: boolean
  insetControls: boolean
  autoplay: boolean
}>()
const { t } = useI18n()
const container = shallowRef<SwiperContainer | null>(null)
const instance = shallowRef<Swiper | null>(null)
let disposed = false
const mobileQuery = window.matchMedia('(max-width: 767px)')
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
const mobile = shallowRef(mobileQuery.matches)
const active = shallowRef(0)
const groupSize = computed(() => (mobile.value || props.autoplay ? 1 : props.desktopSlides))
const pages = computed(() => Math.ceil(props.count / groupSize.value))
const currentPage = computed(() => Math.min(active.value, pages.value - 1))
// 多列与移动端露出下一张时，少量卡片不满足 loop 缓冲要求，使用 rewind 首尾回绕。
const canLoop = computed(() => props.autoplay && props.count > 1)
const options = computed<SwiperOptions>(() => {
  const looping = canLoop.value
  return {
    slidesPerView: !props.autoplay && props.peek && props.count > 1 ? 1.12 : 1,
    slidesPerGroup: 1,
    spaceBetween: 12,
    speed: motionQuery.matches ? 0 : props.autoplay ? 600 : 350,
    watchOverflow: true,
    // loop 会改写 DOM；开着 observer 容易在换页时被重置。
    observer: !looping,
    observeSlideChildren: false,
    loop: looping,
    rewind: !looping,
    // 精选自动轮播用淡入淡出，末页回到首页无缝过渡。
    effect: props.autoplay ? 'fade' : 'slide',
    fadeEffect: props.autoplay ? { crossFade: true } : undefined,
    a11y: { enabled: true },
    autoplay:
      props.autoplay && !motionQuery.matches
        ? { delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true }
        : false,
    breakpoints: {
      768: {
        slidesPerView: props.autoplay ? 1 : props.desktopSlides,
        slidesPerGroup: props.autoplay ? 1 : props.desktopSlides,
        spaceBetween: props.autoplay ? 0 : props.desktopGap,
      },
    },
  }
})
function sync() {
  const swiper = container.value?.swiper
  if (!swiper) {
    active.value = 0
    return
  }
  active.value = swiper.params.loop
    ? Math.floor(swiper.realIndex / groupSize.value)
    : swiper.snapIndex
}
function goToPage(page: number) {
  const index = page * groupSize.value
  if (canLoop.value) instance.value?.slideToLoop(index)
  else instance.value?.slideTo(index)
}
function pause() {
  instance.value?.autoplay?.stop()
}
function resize() {
  mobile.value = mobileQuery.matches
  sync()
}
function motionChanged() {
  if (motionQuery.matches) pause()
  if (instance.value) instance.value.params.speed = motionQuery.matches ? 0 : 350
}
onMounted(async () => {
  await customElements.whenDefined('swiper-container')
  if (disposed || !container.value) return
  Object.assign(container.value, options.value)
  container.value.initialize()
  instance.value = container.value.swiper
  sync()
  mobileQuery.addEventListener('change', resize)
  motionQuery.addEventListener('change', motionChanged)
})
onScopeDispose(() => {
  disposed = true
  mobileQuery.removeEventListener('change', resize)
  motionQuery.removeEventListener('change', motionChanged)
  instance.value?.destroy(true, true)
})
</script>

<template>
  <div
    class="home-swiper"
    :class="{ 'home-swiper--inset': insetControls }"
    role="region"
    :aria-label="label"
    @focusin="pause"
    @keydown.left.prevent="instance?.slidePrev()"
    @keydown.right.prevent="instance?.slideNext()"
  >
    <swiper-container
      ref="container"
      :init="false"
      @swiperslidechange="sync"
      @swipersnapindexchange="sync"
      @swiperresize="resize"
      @swiperbreakpoint="resize"
    >
      <slot />
    </swiper-container>
    <div v-if="pages > 1" class="home-swiper__controls">
      <div class="home-swiper__dots">
        <button
          v-for="dot in pages"
          :key="dot"
          type="button"
          :aria-label="t('home.slide', { page: dot })"
          :aria-pressed="dot - 1 === currentPage"
          @click="goToPage(dot - 1)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-swiper {
  position: relative;
  min-width: 0;

  swiper-container {
    display: block;
    min-width: 0;

    --swiper-theme-color: var(--ic-color-academy-primary);
  }

  :deep(swiper-slide) {
    height: auto;
    min-width: 0;
  }

  &__controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--ic-spacing-2);
    margin-top: var(--ic-spacing-5);
  }

  &__dots {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;

    button {
      display: grid;
      width: 28px;
      height: 24px;
      place-items: center;

      &::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: var(--ic-border-radius-full);
        background: var(--ic-color-brand-200);
      }

      &[aria-pressed='true']::before {
        width: 18px;
        background: var(--ic-color-academy-primary);
      }
    }
  }

  button {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ic-color-academy-primary);
    cursor: pointer;

    &:focus-visible {
      outline: 2px solid currentcolor;
      outline-offset: 2px;
      border-radius: var(--ic-border-radius-sm);
    }
  }

  &--inset .home-swiper__controls {
    position: absolute;
    z-index: 2;
    right: 0;
    bottom: 6px;
    left: 0;
    margin-top: 0;
  }
}

@media (max-width: 767px) {
  .home-swiper {
    &__controls {
      margin-top: var(--ic-spacing-3);
    }

    &__dots button {
      height: 44px;
    }
  }
}
</style>
