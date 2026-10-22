<script setup lang="ts" generic="T">
import HomeSwiper from './HomeSwiper.client.vue'

const props = withDefaults(
  defineProps<{
    items: T[]
    itemKey: (item: T) => string | number
    label: string
    desktopSlides?: number
    desktopGap?: number
    peek?: boolean
    insetControls?: boolean
    autoplay?: boolean
    autoplayDelay?: number
    effect?: 'slide' | 'fade'
  }>(),
  {
    desktopSlides: 1,
    desktopGap: 24,
    peek: true,
    insetControls: false,
    autoplay: false,
    autoplayDelay: 5000,
    effect: 'slide',
  },
)
const emit = defineEmits<{ change: [page: number] }>()
defineSlots<{ default(props: { item: T; index: number }): unknown }>()
// Swiper 的循环模式会调整 DOM；条目变化后重建实例，避免沿用旧循环状态。
const slideKey = computed(() => JSON.stringify(props.items.map(props.itemKey)))
</script>

<template>
  <div
    class="home-carousel"
    :style="{
      '--carousel-columns': desktopSlides,
      '--carousel-gap': `${desktopGap}px`,
      '--carousel-mobile-width': peek && items.length > 1 ? '88%' : '100%',
    }"
  >
    <ClientOnly>
      <HomeSwiper
        :key="slideKey"
        :count="items.length"
        :label="label"
        :desktop-slides="desktopSlides"
        :desktop-gap="desktopGap"
        :peek="peek"
        :inset-controls="insetControls"
        :autoplay="autoplay"
        :autoplay-delay="autoplayDelay"
        :effect="effect"
        @change="emit('change', $event)"
      >
        <swiper-slide v-for="(item, index) in items" :key="itemKey(item)">
          <slot :item="item" :index="index" />
        </swiper-slide>
      </HomeSwiper>
      <template #fallback>
        <div class="home-carousel__fallback" :aria-label="label">
          <div v-for="(item, index) in items" :key="itemKey(item)">
            <slot :item="item" :index="index" />
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.home-carousel {
  min-width: 0;

  &__fallback {
    display: grid;
    overflow: hidden;
    grid-auto-flow: column;
    grid-auto-columns: calc(
      (100% - (var(--carousel-columns) - 1) * var(--carousel-gap)) / var(--carousel-columns)
    );
    gap: var(--carousel-gap);

    > div {
      min-width: 0;
    }
  }
}

@media (max-width: 767px) {
  .home-carousel__fallback {
    grid-auto-columns: var(--carousel-mobile-width);
    gap: var(--ic-spacing-3);
  }
}
</style>
