<script setup lang="ts">
import UnavailableFeature from '~/components/app/UnavailableFeature.vue'

definePageMeta({ academyGate: { auth: true } })
</script>

<template>
  <UnavailableFeature capability="lingyue" />
</template>
