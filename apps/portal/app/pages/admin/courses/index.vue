<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  academyGate: { permission: 'course:manage' },
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
