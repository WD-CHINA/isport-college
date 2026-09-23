<script setup lang="ts">
import CreationOverview from '~/components/features/creation/CreationOverview.vue'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
</script>

<template>
  <CreationOverview />
</template>
