<script setup lang="ts">
import type { WebContentCard, WebNews } from '@isport/shared'
import { useContentLink } from '~/composables/useContentLink'

const props = defineProps<{ content: WebContentCard | WebNews }>()
const { href, isLink, open } = useContentLink(() => props.content)
</script>

<template>
  <NuxtLink
    :to="href"
    :external="isLink"
    :target="isLink ? '_blank' : undefined"
    :rel="isLink ? 'noopener noreferrer' : undefined"
    @click="open"
  >
    <slot />
  </NuxtLink>
</template>
