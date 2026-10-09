<script setup lang="ts">
import { isApiError } from '~/api/errors'
import { isContentAssetUrl } from '@isport/shared'
import { useApiUrl } from '~/utils/api-url'
import { RichTextContent } from '@isport/rich-text'
import { Alert as AAlert, Button as AButton } from 'antdv-next'

const props = defineProps<{ id: string }>()
const academy = useAcademy()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const apiUrl = useApiUrl()
const teacherId = /^[1-9]\d{0,15}$/.test(props.id) ? Number(props.id) : 0
const request = useAsyncData(
  () => `academy:teacher:${locale.value}:${props.id}`,
  () => {
    if (!teacherId) throw createError({ statusCode: 404, statusMessage: t('detail.notFound') })
    return academy.teacher(teacherId)
  },
)
const { data, error, refresh } = request
const notFound = computed(
  () =>
    error.value?.statusCode === 404 ||
    (isApiError(error.value) && error.value.code === 'NOT_FOUND'),
)
useSeoMeta({ title: () => data.value?.name || t('detail.notFound') })
await request
</script>

<template>
  <main class="container-page teacher-detail">
    <template v-if="error">
      <h1 v-if="notFound">{{ t('detail.notFound') }}</h1>
      <AAlert v-else type="error" show-icon :title="t('academy.requestFailed')">
        <template #action
          ><AButton @click="refresh()">{{ t('catalog.retry') }}</AButton></template
        >
      </AAlert>
    </template>
    <article v-else-if="data">
      <NuxtLink :to="localePath('/teachers')">{{ t('academy.teachers') }}</NuxtLink>
      <header>
        <img
          v-if="isContentAssetUrl(apiUrl(data.avatarUrl))"
          :src="apiUrl(data.avatarUrl)"
          alt=""
        />
        <h1>{{ data.name }}</h1>
        <p>{{ data.honorTitle }}</p>
        <p>{{ data.jobTitle }} · {{ data.schoolOrg }}</p>
      </header>
      <RichTextContent v-if="data.story" :content="data.story" />
    </article>
  </main>
</template>

<style scoped>
.teacher-detail {
  padding-top: 32px;
  padding-bottom: 56px;
}

.teacher-detail img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
}

.teacher-detail h1 {
  margin: 16px 0 8px;
}
</style>
