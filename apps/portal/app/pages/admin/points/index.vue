<script setup lang="ts">
import PointsFeature from '~/components/features/creation/PointsFeature.vue'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
</script>

<template>
  <PointsFeature />
</template>
