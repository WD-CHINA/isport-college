<script setup lang="ts">
const { t } = useI18n()
const partners = [
  { src: '3a897.png', name: '上海体育大学', width: 161.474, height: 31.053 },
  { src: '75431.png', name: '北京体育大学', width: 128.391, height: 31.053 },
  { src: 'c53fa.png', name: '南京师范大学', width: 141.023, height: 33.123 },
  { src: '309c9.png', name: '华南师范大学', width: 153.347, height: 51.755 },
]
</script>
<template>
  <section class="home-partners" :aria-label="t('home.partnersLabel')">
    <ul class="container-page home-partners__list">
      <li><img src="/home/figma/41006.svg" alt="华东师范大学" /></li>
      <li class="home-partners__shnu">
        <img src="/home/partner-shnu.svg" alt="上海师范大学" width="133.208" height="33.123" />
      </li>
      <li v-for="partner in partners" :key="partner.src">
        <img
          :src="`/home/figma/${partner.src}`"
          :alt="partner.name"
          :width="partner.width"
          :height="partner.height"
        />
      </li>
    </ul>
  </section>
</template>
<style lang="scss" scoped>
.home-partners {
  background: var(--ic-color-academy-background-page);

  &__list {
    display: flex;
    min-height: 99.755px;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-block: 0;
    padding-block: 24px;
    list-style: none;

    > li {
      flex: none;
    }

    img {
      display: block;
    }
  }
}

@media (max-width: 1199px) {
  .home-partners {
    &__list {
      flex-wrap: wrap;
      justify-content: center;
      gap: 24px 48px;
    }
  }
}

@media (max-width: 767px) {
  .home-partners {
    &__list {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      justify-items: center;
      gap: 12px 16px;
      min-height: 0;
      padding-block: 16px;

      > li {
        min-width: 0;
        max-width: 100%;
      }

      > li > img {
        max-width: 100%;
        height: auto;
      }
    }
  }
}
</style>
