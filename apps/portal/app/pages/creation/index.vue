<script setup lang="ts">
import CreationFeature from './components/CreationFeature.vue'

definePageMeta({ layout: 'creation' })
const { t } = useI18n()
useSeoMeta({ title: () => t('nav.creation'), robots: 'noindex, nofollow, noarchive' })
</script>

<template>
  <CreationFeature />
</template>
