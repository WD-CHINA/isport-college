<script setup lang="ts">
import { message } from 'antdv-next'
import type { WebContentCard, WebNews } from '@isport/shared'
import { useContentLink } from '~/composables/useContentLink'

const props = defineProps<{ content: WebContentCard | WebNews }>()
const { t } = useI18n()
const [messageApi, ContextHolder] = message.useMessage()
const { href, isLink, open } = useContentLink(
  () => props.content,
  () => messageApi.error(t('catalog.linkUnavailable')),
)
</script>

<template>
  <NuxtLink
    :to="href"
    :external="isLink"
    :target="isLink ? '_blank' : undefined"
    :rel="isLink ? 'noopener noreferrer' : undefined"
    @click="open"
  >
    <ContextHolder />
    <slot />
  </NuxtLink>
</template>
