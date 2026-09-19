<script setup lang="ts">
import { Card as ACard, Statistic as AStatistic } from 'antdv-next'

const { $dashboardRepository } = useNuxtApp()
const { t } = useI18n()

const { data: stats } = await useAsyncData('home-stats', () => $dashboardRepository.getStats())

const items = computed(() => [
  { label: t('home.statsStudents'), value: stats.value?.totalStudents ?? '-' },
  { label: t('home.statsCourses'), value: stats.value?.totalCourses ?? '-' },
  { label: t('home.statsCoaches'), value: stats.value?.totalCoaches ?? '-' },
])
</script>

<template>
  <section class="container-page home-stats" aria-label="stats">
    <ACard variant="borderless" class="home-stats__card">
      <div class="home-stats__grid">
        <AStatistic
          v-for="item in items"
          :key="item.label"
          class="home-stats__item"
          :title="item.label"
          :value="item.value"
          :value-style="{ color: 'var(--ic-color-brand-600, #1d4ed8)', fontWeight: 700 }"
        />
      </div>
    </ACard>
  </section>
</template>

<style scoped>
.home-stats {
  margin-top: calc(-1 * var(--ic-spacing-8, 32px));
}

.home-stats__card {
  box-shadow: var(--ic-box-shadow-md, 0 4px 12px -2px rgb(15 23 42 / 10%));
}

.home-stats__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ic-spacing-4, 16px);
}

.home-stats__item {
  text-align: center;
}
</style>
