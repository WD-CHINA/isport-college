<script setup lang="ts">
import type { WebChannel } from '@isport/shared'
import { useDetailIndexing } from '~/composables/useDetailIndexing'
import OutboundLinkFeature from '~/components/content/OutboundLinkFeature.vue'

definePageMeta({ layout: false })
const route = useRoute()
const channels = new Map<string, WebChannel | 'NEWS'>([
  ['resources', 'RESOURCE'],
  ['research', 'RESEARCH'],
  ['schools', 'SCHOOL'],
  ['news', 'NEWS'],
])
const channel = channels.get(String(route.params.channel))
const id = Number(route.params.id)
if (!channel || !/^[1-9]\d*$/.test(String(route.params.id)) || !Number.isSafeInteger(id)) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}
useDetailIndexing(() => true)
</script>

<template>
  <OutboundLinkFeature :id="id" :channel="channel" />
</template>
