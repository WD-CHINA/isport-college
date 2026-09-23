<script setup lang="ts">
const route = useRoute()
const localePath = useLocalePath()
const id = String(route.params.id)
// 旧演示编号 1–30 对应资源种子，其他编号没有兼容记录。
if (!/^(?:[1-9]|[12]\d|30)$/.test(id)) throw createError({ statusCode: 404 })
await navigateTo(localePath({ path: `/resources/${id}`, query: route.query }), {
  redirectCode: 301,
  replace: true,
})
</script>

<template>
  <div />
</template>
