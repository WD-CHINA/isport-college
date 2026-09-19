<script setup lang="ts">
import { antdvThemeToken } from '@isport/design-tokens/antdv-theme'
import { resolveDataLocale } from '@isport/shared'
import { App as AApp, ConfigProvider as AConfigProvider } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'

const { locale, localeProperties, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const preventIndexing = runtimeConfig.public.siteEnv !== 'production'

// html[lang] 使用完整语言码（zh-CN/en-US），提升可访问性与 SEO 识别
useHead(() => ({
  htmlAttrs: { lang: localeProperties.value.language ?? locale.value },
}))

// html[lang]、antdv-next Locale 与 dayjs Locale 必须同步切换
const antdLocale = computed(() => (resolveDataLocale(locale.value) === 'en-US' ? enUS : zhCN))

useSeoMeta({
  titleTemplate: title => (title ? `${title} - ${t('seo.siteName')}` : t('seo.siteName')),
  robots: preventIndexing ? 'noindex, nofollow, noarchive' : undefined,
})
</script>

<template>
  <AConfigProvider :locale="antdLocale" :theme="{ token: antdvThemeToken }">
    <AApp class="min-h-screen">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <!-- 全局唯一登录弹窗：路由门禁与操作门禁共用 -->
      <LoginModal />
    </AApp>
  </AConfigProvider>
</template>
