<script setup lang="ts">
import UnavailableFeature from '~/components/app/UnavailableFeature.vue'

definePageMeta({ academyGate: { permission: 'account:view' } })
</script>

<template>
  <UnavailableFeature capability="teacherProfile" />
</template>
