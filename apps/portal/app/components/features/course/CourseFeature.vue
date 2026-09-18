<script setup lang="ts">
import type { CourseListQuery } from '@isport/api-client'

const { t } = useI18n()

const query = shallowRef<CourseListQuery>({ page: 1, pageSize: 9 })

const { data, status } = await useCourseList({
  key: 'course-list',
  query: () => query.value,
})

const courses = computed(() => data.value?.list ?? [])
const total = computed(() => data.value?.total ?? 0)
const pageSize = computed(() => data.value?.pageSize ?? 9)
const loading = computed(() => status.value === 'pending')

const page = computed({
  get: () => query.value.page ?? 1,
  set: (value: number) => {
    query.value = { ...query.value, page: value }
  },
})

function resetFilters() {
  query.value = { page: 1, pageSize: 9 }
}
</script>

<template>
  <section class="container-page course-feature">
    <header class="course-feature__head">
      <h1 class="course-feature__title">{{ t('course.listTitle') }}</h1>
      <p class="course-feature__subtitle">{{ t('course.listSubtitle') }}</p>
    </header>
    <CourseFilters v-model="query" class="course-feature__filters" />
    <CourseList v-if="loading || courses.length > 0" :courses="courses" :loading="loading" />
    <CourseEmptyState v-else @reset="resetFilters" />
    <CoursePagination
      v-if="!loading && courses.length > 0"
      v-model:page="page"
      :total="total"
      :page-size="pageSize"
    />
  </section>
</template>

<style scoped>
.course-feature {
  padding-top: var(--ic-spacing-8, 32px);
  padding-bottom: var(--ic-spacing-16, 64px);
}

.course-feature__head {
  margin-bottom: var(--ic-spacing-6, 24px);
}

.course-feature__title {
  font-size: var(--ic-font-size-3xl, 30px);
  font-weight: var(--ic-font-weight-bold, 700);
}

.course-feature__subtitle {
  margin-top: var(--ic-spacing-1, 4px);
  color: var(--ic-color-text-secondary, #475569);
}

.course-feature__filters {
  margin-bottom: var(--ic-spacing-6, 24px);
}
</style>
