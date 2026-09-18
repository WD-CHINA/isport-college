<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDesc'),
  ogTitle: () => t('seo.homeTitle'),
  ogDescription: () => t('seo.homeDesc'),
  ogType: 'website',
})
</script>

<template>
  <HomeFeature />
</template>
