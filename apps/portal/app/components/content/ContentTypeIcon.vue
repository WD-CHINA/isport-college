<script setup lang="ts">
import type { WebDetailType } from '@isport/shared'
import { contentMediaIcon } from './content-media'

withDefaults(defineProps<{ type: WebDetailType; size?: number }>(), { size: 32 })
</script>

<template>
  <img
    class="content-type-icon"
    :src="contentMediaIcon(type)"
    alt=""
    :width="size"
    :height="size"
  />
</template>

<style scoped>
.content-type-icon {
  display: block;
  flex: none;
}
</style>
