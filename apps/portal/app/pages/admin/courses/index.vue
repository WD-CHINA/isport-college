<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()

useSeoMeta({
  title: () => `${t('nav.courseManage')} - ${t('seo.adminTitle')}`,
  robots: 'noindex, nofollow, noarchive',
})
</script>

<template>
  <AdminCourseManageFeature />
</template>
