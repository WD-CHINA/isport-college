<script setup lang="ts">
import { Button as AButton } from 'antdv-next'

const { t } = useI18n()
const localePath = useLocalePath()

function viewCourses() {
  void navigateTo(localePath('/courses'))
}
</script>

<template>
  <section class="home-hero">
    <div class="container-page home-hero__inner">
      <h1 class="home-hero__title">{{ t('home.heroTitle') }}</h1>
      <p class="home-hero__subtitle">{{ t('home.heroSubtitle') }}</p>
      <AButton size="large" class="home-hero__cta" @click="viewCourses">
        {{ t('home.heroPrimary') }}
      </AButton>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  background-image:
    radial-gradient(60% 120% at 85% 10%, rgb(249 115 22 / 18%), transparent),
    linear-gradient(160deg, var(--ic-color-brand-800, #1e3a8a), var(--ic-color-brand-500, #2563eb));
  color: var(--ic-color-text-inverse, #fff);
}

.home-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ic-spacing-4, 16px);
  padding-top: var(--ic-spacing-16, 64px);
  padding-bottom: var(--ic-spacing-16, 64px);
}

.home-hero__title {
  max-width: 40rem;
  font-size: var(--ic-font-size-3xl, 30px);
  font-weight: var(--ic-font-weight-bold, 700);
  line-height: var(--ic-line-height-tight, 1.25);
}

.home-hero__subtitle {
  max-width: 34rem;
  font-size: var(--ic-font-size-base, 16px);
  color: rgb(255 255 255 / 85%);
}

.home-hero__cta {
  margin-top: var(--ic-spacing-2, 8px);
  color: var(--ic-color-brand-600, #1d4ed8);
}

@media (min-width: 768px) {
  .home-hero__title {
    font-size: var(--ic-font-size-4xl, 36px);
  }
}
</style>
