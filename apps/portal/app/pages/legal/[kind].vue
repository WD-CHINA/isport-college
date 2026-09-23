<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const privacy = computed(() => route.params.kind === 'privacy')
if (!['terms', 'privacy'].includes(String(route.params.kind)))
  throw createError({ statusCode: 404 })
useSeoMeta({ title: () => t(privacy.value ? 'academy.privacy' : 'academy.terms') })
</script>

<template>
  <article class="container-page py-10">
    <h1>{{ t(privacy ? 'academy.privacy' : 'academy.terms') }}</h1>
    <p class="my-6">{{ t('academy.legalNotice') }}</p>
    <p>{{ t(privacy ? 'academy.legalPrivacy' : 'academy.legalTerms') }}</p>
  </article>
</template>
