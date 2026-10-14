<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <section class="home-hero">
    <div class="container-page home-hero__inner">
      <p class="home-hero__eyebrow">{{ t('home.heroEyebrow') }}</p>
      <h1 class="home-hero__title">{{ t('home.heroTitle') }}</h1>
      <p class="home-hero__lead">{{ t('home.heroLead') }}</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.home-hero {
  position: relative;
  min-height: 480px;
  background: #14508f url('/home/figma/48fa6.png') center / cover no-repeat;
  color: #fff;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      rgb(0 119 250 / 90%) 0%,
      rgb(0 146 250 / 60%) 45%,
      rgb(0 146 250 / 10%) 75%,
      rgb(0 146 250 / 10%) 100%
    );
  }

  &__inner {
    position: relative;
    display: flex;
    min-height: 480px;
    flex-direction: column;
    padding-top: 80px;
    gap: 20px;
  }

  &__eyebrow {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
  }

  &__title {
    max-width: 650px;
    margin: 0;
    font-size: 46px;
    font-weight: 600;
    line-height: 72px;
    white-space: pre-line;

    &:lang(en-US) {
      line-height: 55px;
    }
  }

  &__lead {
    max-width: 500px;
    margin: 0;
    color: #d5e1ee;
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
  }
}

@media (max-width: 767px) {
  .home-hero {
    &,
    &__inner {
      min-height: 360px;
    }

    &__title {
      font-size: 32px;
      line-height: 44px;
    }

    &__inner {
      padding-top: 48px;
      padding-bottom: 96px;
    }
  }
}
</style>
