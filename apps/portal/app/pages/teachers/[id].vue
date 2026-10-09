<script setup lang="ts">
import TeacherDetailFeature from '~/components/features/catalog/TeacherDetailFeature.vue'

const route = useRoute()
definePageMeta({ key: route => route.path })
</script>

<template>
  <TeacherDetailFeature :id="String(route.params.id)" />
</template>
