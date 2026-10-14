<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const items = computed(() => [
  {
    title: t('home.capabilityDesign'),
    desc: t('home.capabilityDesignDesc'),
    to: localePath('/resources'),
    icon: 'eb337.svg',
  },
  {
    title: t('home.capabilityPractice'),
    desc: t('home.capabilityPracticeDesc'),
    to: localePath('/schools'),
    icon: 'a8f62.svg',
  },
  {
    title: t('home.capabilityStudy'),
    desc: t('home.capabilityStudyDesc'),
    to: localePath('/research'),
    icon: 'd91b1.svg',
  },
  {
    title: t('home.capabilityExpert'),
    desc: t('home.capabilityExpertDesc'),
    to: localePath('/teachers'),
    icon: 'cf724.svg',
  },
])
</script>

<template>
  <section class="home-capabilities">
    <div class="container-page">
      <ul>
        <li v-for="item in items" :key="item.icon">
          <NuxtLink :to="item.to">
            <span class="home-capabilities__icon" aria-hidden="true">
              <img :src="`/home/figma/${item.icon}`" alt="" />
            </span>
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.desc }}</small>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.home-capabilities {
  position: relative;
  z-index: 1;
  margin-top: -64px;
  padding-bottom: 36px;
  background: linear-gradient(transparent 64px, #fbfdff 64px);
}

.home-capabilities ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin: 0;
  padding: 36px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
  list-style: none;
}

.home-capabilities a {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  color: #1c1f23;
}

.home-capabilities__icon {
  display: grid;
  width: 60px;
  height: 60px;
  flex: none;
  place-items: center;
  border-radius: 6px;
  background: #eaf5ff;
  color: #3295fb;
}

.home-capabilities__icon img {
  display: block;
}

.home-capabilities strong,
.home-capabilities small {
  display: block;
}

.home-capabilities strong {
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.home-capabilities small {
  margin-top: 6px;
  color: rgb(28 31 35 / 60%);
  font-size: 13px;
  line-height: 20px;
}

@media (max-width: 900px) {
  .home-capabilities ul {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .home-capabilities ul {
    grid-template-columns: 1fr;
  }
}
</style>
