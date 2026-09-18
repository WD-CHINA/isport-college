<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { t } = useI18n()

// 管理端禁止收录（Route Rules 已输出 X-Robots-Tag 响应头，此处输出等价 Meta）
useSeoMeta({
  title: () => t('seo.adminTitle'),
  robots: 'noindex, nofollow, noarchive',
})
</script>

<template>
  <AdminDashboardFeature />
</template>
