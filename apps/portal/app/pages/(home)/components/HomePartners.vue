<script setup lang="ts">
const { t } = useI18n()
const partners = [
  { src: '/home/partner-ecnu.png', name: '华东师范大学' },
  { src: '/home/partner-shnu.png', name: '上海师范大学' },
  { src: '/home/partner-sus.png', name: '上海体育大学' },
  { src: '/home/partner-bsu.png', name: '北京体育大学' },
  { src: '/home/partner-njnu.png', name: '南京师范大学' },
  { src: '/home/partner-scnu.png', name: '华南师范大学' },
]
</script>

<template>
  <section class="home-partners" :aria-label="t('home.partnersLabel')">
    <div class="container-page">
      <ul>
        <li v-for="partner in partners" :key="partner.src">
          <img :src="partner.src" :alt="partner.name" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.home-partners {
  background: #fbfdff;
}

.home-partners ul {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin: 0;
  padding: 24px 0;
  list-style: none;
}

.home-partners img {
  display: block;
  width: auto;
  max-width: 160px;
  height: 32px;
  object-fit: contain;
}

@media (max-width: 767px) {
  .home-partners ul {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
