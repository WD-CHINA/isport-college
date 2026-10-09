<script setup lang="ts">
import PointsFeature from '~/components/features/creation/PointsFeature.vue'

definePageMeta({ layout: 'admin', academyGate: { permission: 'creation:use' } })
</script>

<template>
  <PointsFeature />
</template>
