<script setup lang="ts">
import { ensureAcademySession } from '~/composables/useAcademy'
import LoginModal from '~/components/auth/LoginModal.vue'
import LogoutConfirm from '~/components/auth/LogoutConfirm.vue'
import NicknameGuide from '~/components/auth/NicknameGuide.vue'
import { antdvThemeToken } from '@isport/design-tokens/antdv-theme'
import { resolveDataLocale } from '@isport/shared'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'

const { locale, localeProperties, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const preventIndexing = runtimeConfig.public.siteEnv !== 'production'

// 公开页首屏不等待资料服务；受保护页在路由门禁中验证会话。
onMounted(() => {
  void ensureAcademySession()
})

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
    </AApp>
  </AConfigProvider>
</template>
