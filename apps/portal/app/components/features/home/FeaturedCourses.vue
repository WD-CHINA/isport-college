<script setup lang="ts">
import { Button as AButton } from 'antdv-next'

const { t } = useI18n()
const localePath = useLocalePath()

const { data, status } = await useCourseList({
  key: 'home-featured-courses',
  query: { featured: true, page: 1, pageSize: 6 },
})

const courses = computed(() => data.value?.list ?? [])
const loading = computed(() => status.value === 'pending')

function viewMore() {
  void navigateTo(localePath('/courses'))
}
</script>

<template>
  <section class="container-page featured-courses">
    <div class="featured-courses__head">
      <div>
        <h2 class="featured-courses__title">{{ t('home.featuredTitle') }}</h2>
        <p class="featured-courses__subtitle">{{ t('home.featuredSubtitle') }}</p>
      </div>
      <AButton type="link" class="featured-courses__more" @click="viewMore">
        {{ t('common.viewMore') }}
      </AButton>
    </div>
    <CourseList :courses="courses" :loading="loading" />
  </section>
</template>

<style scoped>
.featured-courses {
  margin-top: var(--ic-spacing-10, 40px);
}

.featured-courses__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ic-spacing-4, 16px);
  margin-bottom: var(--ic-spacing-5, 20px);
}

.featured-courses__title {
  font-size: var(--ic-font-size-2xl, 24px);
  font-weight: var(--ic-font-weight-bold, 700);
}

.featured-courses__subtitle {
  margin-top: var(--ic-spacing-1, 4px);
  font-size: var(--ic-font-size-sm, 14px);
  color: var(--ic-color-text-secondary, #475569);
}

.featured-courses__more {
  flex-shrink: 0;
  font-size: var(--ic-font-size-sm, 14px);
}
</style>
