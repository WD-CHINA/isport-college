<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const courseId = computed(() => String(route.params.id))

useSeoMeta({
  title: () => t('course.detail'),
})
</script>

<template>
  <CourseDetailFeature :course-id="courseId" />
</template>
