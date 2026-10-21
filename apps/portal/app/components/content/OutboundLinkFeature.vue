<script setup lang="ts">
import { isPublicHttpUrl, type WebChannel } from '@isport/shared'
import { useAcademy } from '~/composables/useAcademy'
import { useApiUrl } from '~/utils/api-url'

const props = defineProps<{ channel: WebChannel | 'NEWS'; id: number }>()
const academy = useAcademy()
const apiUrl = useApiUrl()
const { t, locale } = useI18n()
const localePath = useLocalePath()
// 先直出品牌和加载提示，水合后才查询地址，接口慢时也有可见内容。
const { data, error, refresh } = useAsyncData(
  () => `outbound:${locale.value}:${props.channel}:${props.id}`,
  async (_app, { signal }) => {
    const detail =
      props.channel === 'NEWS'
        ? await academy.newsDetail(props.id, signal)
        : await academy.content(props.channel, props.id, signal)
    const url = apiUrl(detail.jumpUrl)
    if (detail.detailType !== 'LINK' || !isPublicHttpUrl(url)) {
      throw new Error('External link unavailable')
    }
    return url
  },
  { server: false },
)
watch(data, url => {
  if (import.meta.client && url) window.location.replace(url)
})
useSeoMeta({ title: () => t('catalog.openingLink') })
</script>

<template>
  <main class="outbound-link">
    <div class="outbound-link__card" :aria-busy="!error">
      <img src="/home/figma/5aa99.svg" width="160" height="40" :alt="t('nav.brand')" />
      <h1>{{ error ? t('catalog.linkUnavailable') : t('catalog.openingLink') }}</h1>
      <p v-if="!error" role="status">{{ t('common.loading') }}</p>
      <template v-else>
        <AButton type="primary" @click="refresh()">{{ t('catalog.retry') }}</AButton>
        <NuxtLink :to="localePath('/')">{{ t('common.backHome') }}</NuxtLink>
      </template>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.outbound-link {
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--ic-color-academy-background-page);

  &__card {
    display: flex;
    width: 100%;
    max-width: 480px;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    padding: 40px 24px;
    border: 1px solid var(--ic-color-academy-border-base);
    border-radius: 16px;
    background: #fff;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 20px;
    line-height: 30px;
  }

  p {
    margin: 0;
    color: var(--ic-color-academy-text-secondary);
  }
}
</style>
