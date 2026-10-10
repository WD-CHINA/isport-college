<script setup lang="ts">
import { Empty as AEmpty } from 'antdv-next'

defineProps<{ description: string }>()

// 内置插图是模块级 VNode；只复用组件类型，每次渲染创建新节点，避免切换页面时复用旧状态。
const EmptyImage = AEmpty.PRESENTED_IMAGE_DEFAULT.type
</script>

<template>
  <AEmpty :description="description">
    <template #image><component :is="EmptyImage" /></template>
  </AEmpty>
</template>
