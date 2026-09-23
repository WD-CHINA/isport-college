<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
await navigateTo(localePath({ path: '/resources', query: route.query }), {
  redirectCode: 301,
  replace: true,
})
</script>

<template>
  <div />
</template>
