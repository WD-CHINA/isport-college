<script setup lang="ts">
import ContentDetailFeature from '~/components/features/content/ContentDetailFeature.vue'
const route = useRoute()
definePageMeta({ key: route => route.path })
</script>

<template>
  <ContentDetailFeature :id="String(route.params.id)" channel="school" />
</template>
