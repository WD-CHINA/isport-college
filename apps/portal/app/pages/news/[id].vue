<script setup lang="ts">
import NewsDetailFeature from './components/NewsDetailFeature.vue'

const route = useRoute()
definePageMeta({ key: route => route.path })
</script>

<template>
  <NewsDetailFeature :id="String(route.params.id)" />
</template>
