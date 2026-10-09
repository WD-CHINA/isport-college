<script setup lang="ts">
import CreationOverview from '~/components/features/creation/CreationOverview.vue'

definePageMeta({ layout: 'admin', academyGate: { permission: 'creation:use' } })
</script>

<template>
  <CreationOverview />
</template>
