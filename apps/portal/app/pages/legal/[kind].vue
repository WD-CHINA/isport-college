<script setup lang="ts">
import LegalDocument from './components/LegalDocument.vue'

definePageMeta({
  validate: route => ['terms', 'privacy'].includes(String(route.params.kind)),
})

const route = useRoute()
const { t } = useI18n()
const kind = computed(() => (route.params.kind === 'privacy' ? 'privacy' : 'terms'))
useSeoMeta({ title: () => t(kind.value === 'privacy' ? 'academy.privacy' : 'academy.terms') })
</script>

<template>
  <LegalDocument :kind="kind" />
</template>
