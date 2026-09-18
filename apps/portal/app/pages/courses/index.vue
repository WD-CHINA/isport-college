<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.coursesTitle'),
  description: () => t('seo.coursesDesc'),
  ogTitle: () => t('seo.coursesTitle'),
  ogDescription: () => t('seo.coursesDesc'),
  ogType: 'website',
})
</script>

<template>
  <CourseFeature />
</template>
