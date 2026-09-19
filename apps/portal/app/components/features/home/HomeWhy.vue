<script setup lang="ts">
import { Card as ACard } from 'antdv-next'

const { t } = useI18n()

const items = computed(() => [
  { title: t('home.why1Title'), desc: t('home.why1Desc') },
  { title: t('home.why2Title'), desc: t('home.why2Desc') },
  { title: t('home.why3Title'), desc: t('home.why3Desc') },
])
</script>

<template>
  <section class="container-page home-why">
    <h2 class="home-why__title">{{ t('home.whyTitle') }}</h2>
    <div class="home-why__grid">
      <ACard v-for="item in items" :key="item.title" :title="item.title">
        <p class="home-why__item-desc">{{ item.desc }}</p>
      </ACard>
    </div>
  </section>
</template>

<style scoped>
.home-why {
  margin-top: var(--ic-spacing-12, 48px);
}

.home-why__title {
  margin-bottom: var(--ic-spacing-5, 20px);
  font-size: var(--ic-font-size-2xl, 24px);
  font-weight: var(--ic-font-weight-bold, 700);
}

.home-why__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ic-spacing-4, 16px);
}

.home-why__item-desc {
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}

@media (min-width: 768px) {
  .home-why__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
