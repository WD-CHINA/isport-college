<script setup lang="ts">
import type { Course } from '@isport/shared'

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
      <div v-for="i in 6" :key="i" class="course-list__skeleton" aria-hidden="true" />
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
  border-radius: var(--ic-border-radius-lg, 12px);
  background: linear-gradient(
    90deg,
    var(--ic-color-border-base, #e2e8f0) 25%,
    var(--ic-color-background-page, #f8fafc) 50%,
    var(--ic-color-border-base, #e2e8f0) 75%
  );
  background-size: 200% 100%;
  animation: course-list-shimmer 1.2s infinite;
}

@keyframes course-list-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
