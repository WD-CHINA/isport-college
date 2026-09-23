<script setup lang="ts">
import SubmissionFeature from '~/components/features/creation/SubmissionFeature.vue'

definePageMeta({ layout: 'admin', middleware: ['auth'] })
const route = useRoute()
const editId = typeof route.query.id === 'string' ? route.query.id : undefined
</script>

<template>
  <SubmissionFeature :key="editId ?? 'new'" :edit-id="editId" />
</template>
