<script setup lang="ts">
import type { Course } from '@isport/shared'
import { Card as ACard } from 'antdv-next'

interface Props {
  courses: Course[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})
</script>

<template>
  <div class="course-list">
    <template v-if="loading">
      <ACard v-for="i in 6" :key="i" loading class="course-list__skeleton" />
    </template>
    <template v-else>
      <CourseCard v-for="course in courses" :key="course.id" :course="course" />
    </template>
  </div>
</template>

<style scoped>
.course-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ic-spacing-4, 16px);
}

@media (min-width: 640px) {
  .course-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .course-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

.course-list__skeleton {
  height: 264px;
}
</style>
