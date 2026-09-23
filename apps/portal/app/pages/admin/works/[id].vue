<script setup lang="ts">
import WorkDetailFeature from '~/components/features/creation/WorkDetailFeature.vue'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
const route = useRoute()
</script>

<template>
  <WorkDetailFeature :id="String(route.params.id)" />
</template>
