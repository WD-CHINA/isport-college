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

<style scoped>
.home-hero {
  position: relative;
  min-height: 480px;
  background: #14508f url('/home/hero.jpg') center / cover no-repeat;
  color: #fff;
}

.home-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgb(16 78 150 / 88%) 0%,
    rgb(22 102 186 / 55%) 38%,
    rgb(70 150 220 / 12%) 100%
  );
}

.home-hero__inner {
  position: relative;
  display: flex;
  min-height: 480px;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

.home-hero__eyebrow {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
}

.home-hero__title {
  max-width: 650px;
  margin: 0;
  font-size: 46px;
  font-weight: 600;
  line-height: 72px;
  white-space: pre-line;
}

.home-hero__lead {
  max-width: 500px;
  margin: 0;
  color: #d5e1ee;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}

@media (max-width: 767px) {
  .home-hero,
  .home-hero__inner {
    min-height: 360px;
  }

  .home-hero__title {
    font-size: 32px;
    line-height: 44px;
  }
}
</style>
