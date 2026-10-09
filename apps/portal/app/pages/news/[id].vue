<script setup lang="ts">
import NewsDetailFeature from '~/components/features/catalog/NewsDetailFeature.vue'

const route = useRoute()
definePageMeta({ key: route => route.path })
</script>

<template>
  <NewsDetailFeature :id="String(route.params.id)" />
</template>
