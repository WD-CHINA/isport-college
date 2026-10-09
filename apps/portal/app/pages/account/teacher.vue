<script setup lang="ts">
import UnavailableFeature from '~/components/features/UnavailableFeature.vue'

definePageMeta({ academyGate: { permission: 'account:view' } })
</script>

<template>
  <UnavailableFeature capability="teacherProfile" />
</template>
