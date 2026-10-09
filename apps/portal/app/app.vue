<script setup lang="ts">
import { antdvThemeToken } from '@isport/design-tokens/antdv-theme'
import { resolveDataLocale } from '@isport/shared'
import { App as AApp, ConfigProvider as AConfigProvider } from 'antdv-next'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'

const { locale, localeProperties, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const preventIndexing = runtimeConfig.public.siteEnv !== 'production'

await ensureAcademySession()

useHead(() => ({
  htmlAttrs: { lang: localeProperties.value.language ?? locale.value },
}))

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
      <LoginModal />
      <NicknameGuide />
      <LogoutConfirm />
      <LingyueDialog />
    </AApp>
  </AConfigProvider>
</template>
