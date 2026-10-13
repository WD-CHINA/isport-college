<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const to = computed(() => localePath('/lingyue/simulation'))
const tools = computed(() => [
  {
    title: t('lingyue.lesson'),
    desc: t('home.lingyueLessonDesc'),
    icon: '/home/lingyue-lesson.png',
  },
  {
    title: t('lingyue.unit'),
    desc: t('home.lingyueUnitDesc'),
    icon: '/home/lingyue-unit.png',
  },
  {
    title: t('lingyue.exercise'),
    desc: t('home.lingyueExerciseDesc'),
    icon: '/home/lingyue-exercise.png',
  },
  {
    title: t('lingyue.assessment'),
    desc: t('home.lingyueAssessmentDesc'),
    icon: '/home/lingyue-assessment.png',
  },
])
</script>

<template>
  <section class="home-lingyue">
    <div class="container-page">
      <header>
        <h2>{{ t('home.lingyueTitle') }}</h2>
        <p>{{ t('home.lingyueSubtitle') }}</p>
      </header>
      <ul>
        <li v-for="tool in tools" :key="tool.title">
          <NuxtLink :to="to">
            <img :src="tool.icon" alt="" width="60" height="60" />
            <span>
              <strong>{{ tool.title }}</strong>
              <small>{{ tool.desc }}</small>
            </span>
            <em aria-hidden="true">›</em>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.home-lingyue {
  padding: 48px 0;
  background:
    url('/home/lingyue-bg.png') right top / cover no-repeat,
    linear-gradient(90deg, #f4f7ff 0%, #eef3ff 45%, #e8f4ff 100%);
}

.home-lingyue header {
  display: grid;
  gap: 6px;
}

.home-lingyue h2 {
  margin: 0;
  background: linear-gradient(90deg, #0079ff 0%, #a348f3 100%);
  background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  font-size: 28px;
  font-weight: 600;
  line-height: 45px;
}

.home-lingyue p {
  margin: 0;
  color: #1c1f23;
  font-size: 14px;
  line-height: 22px;
}

.home-lingyue ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin: 36px 0 0;
  list-style: none;
}

.home-lingyue a {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 108px;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(28 31 35 / 6%);
  color: #1c1f23;
}

.home-lingyue img {
  width: 60px;
  height: 60px;
  flex: none;
  border-radius: 6px;
  object-fit: cover;
}

.home-lingyue span {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: 6px;
}

.home-lingyue strong {
  font-size: 18px;
  font-weight: 500;
  line-height: 28px;
}

.home-lingyue small {
  color: rgb(28 31 35 / 60%);
  font-size: 13px;
  line-height: 20px;
}

.home-lingyue em {
  flex: none;
  color: #68788c;
  font-size: 18px;
  font-style: normal;
  line-height: 1;
}

@media (max-width: 900px) {
  .home-lingyue ul {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .home-lingyue ul {
    grid-template-columns: 1fr;
  }
}
</style>
