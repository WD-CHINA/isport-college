<script setup lang="ts">
import WorksListFeature from '~/components/features/creation/WorksListFeature.vue'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
</script>

<template>
  <WorksListFeature />
</template>
