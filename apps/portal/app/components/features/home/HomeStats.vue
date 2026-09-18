<script setup lang="ts">
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
    <dl class="home-stats__grid">
      <div v-for="item in items" :key="item.label" class="home-stats__item">
        <dt class="home-stats__label">{{ item.label }}</dt>
        <dd class="home-stats__value">{{ item.value }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.home-stats {
  margin-top: calc(-1 * var(--ic-spacing-8, 32px));
}

.home-stats__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ic-spacing-4, 16px);
  padding: var(--ic-spacing-5, 20px) var(--ic-spacing-4, 16px);
  border-radius: var(--ic-border-radius-lg, 12px);
  background-color: var(--ic-color-background-container, #fff);
  box-shadow: var(--ic-box-shadow-md, 0 4px 12px -2px rgb(15 23 42 / 10%));
}

.home-stats__item {
  text-align: center;
}

.home-stats__label {
  font-size: var(--ic-font-size-xs, 12px);
  color: var(--ic-color-text-tertiary, #94a3b8);
}

.home-stats__value {
  margin-top: var(--ic-spacing-1, 4px);
  font-size: var(--ic-font-size-2xl, 24px);
  font-weight: var(--ic-font-weight-bold, 700);
  color: var(--ic-color-brand-600, #1d4ed8);
}
</style>
