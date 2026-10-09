<script setup lang="ts">
import UnavailableFeature from '~/components/features/UnavailableFeature.vue'

definePageMeta({ layout: 'admin', academyGate: { permission: 'creation:use' } })
const { t } = useI18n()
useSeoMeta({ title: () => t('seo.adminTitle'), robots: 'noindex, nofollow, noarchive' })
</script>

<template>
  <UnavailableFeature capability="creation" />
</template>
