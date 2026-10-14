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
      <li class="home-partners__shnu" role="img" aria-label="上海师范大学">
        <img class="home-partners__shnu-name" src="/home/figma/42cd5.svg" alt="" />
        <img class="home-partners__shnu-seal" src="/home/figma/9455c.svg" alt="" />
        <img class="home-partners__shnu-mark" src="/home/figma/f37b0.svg" alt="" />
        <img class="home-partners__shnu-detail" src="/home/figma/20f91.svg" alt="" />
        <img class="home-partners__shnu-dot" src="/home/figma/622ac.svg" alt="" />
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
  background: #fbfdff;

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

  &__shnu {
    position: relative;
    width: 133.208px;
    height: 33.123px;

    img {
      position: absolute;
    }
  }

  &__shnu-name {
    left: 39.13px;
    top: 1.93px;
  }

  &__shnu-seal {
    left: 0;
    top: 0;
  }

  &__shnu-mark {
    left: 2.13px;
    top: 13.63px;
  }

  &__shnu-detail {
    left: 3.71px;
    top: 21.89px;
  }

  &__shnu-dot {
    left: 4.58px;
    top: 22.88px;
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
</style>
