<script setup lang="ts">
import { antdvThemeToken } from '@isport/design-tokens/antdv-theme'
import { resolveDataLocale } from '@isport/shared'
import enUS from 'antdv-next/dist/locale/en_US'
import zhCN from 'antdv-next/dist/locale/zh_CN'

const { locale, localeProperties, t } = useI18n()

// html[lang] 使用完整语言码（zh-CN/en-US），提升可访问性与 SEO 识别
useHead(() => ({
  htmlAttrs: { lang: localeProperties.value.language ?? locale.value },
}))

// html[lang]、antdv-next Locale 与 dayjs Locale 必须同步切换
const antdLocale = computed(() => (resolveDataLocale(locale.value) === 'en-US' ? enUS : zhCN))

useSeoMeta({
  titleTemplate: title => (title ? `${title} - ${t('seo.siteName')}` : t('seo.siteName')),
})
</script>

<template>
  <a-config-provider :locale="antdLocale" :theme="{ token: antdvThemeToken }">
    <a-app class="min-h-screen">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <!-- 全局唯一登录弹窗：路由门禁与操作门禁共用 -->
      <LoginModal />
    </a-app>
  </a-config-provider>
</template>
