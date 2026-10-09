<script setup lang="ts">
import WorksListFeature from '~/components/features/creation/WorksListFeature.vue'

definePageMeta({ layout: 'admin', academyGate: { permission: 'creation:use' } })
</script>

<template>
  <WorksListFeature />
</template>
