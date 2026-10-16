<script setup lang="ts">
import type { ContentChannel } from '@isport/shared'
import ContentDetailFeature from '~/components/catalog/ContentDetailFeature.vue'

const route = useRoute()
const channels = new Map<string, ContentChannel>([
  ['resources', 'resource'],
  ['research', 'research'],
  ['schools', 'school'],
])
const channel = channels.get(String(route.params.channel))
const kind = String(route.params.kind)
if (!channel || (kind !== 'article' && kind !== 'resource')) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
definePageMeta({ key: route => route.path })
</script>

<template>
  <ContentDetailFeature :id="String(route.params.id)" :channel="channel" :kind="kind" />
</template>
