<script setup lang="ts">
import { refreshSessionAfterMount } from '~/composables/useAcademy'
import LoginModal from '~/components/auth/LoginModal.vue'
import LogoutConfirm from '~/components/auth/LogoutConfirm.vue'
import NicknameGuide from '~/components/auth/NicknameGuide.vue'
import LingyueAuthorize from '~/components/auth/LingyueAuthorize.vue'
import AppModalCloseIcon from '~/components/app/AppModalCloseIcon.vue'
import { antdvThemeToken } from '@isport/design-tokens/antdv-theme'
import { resolveDataLocale } from '@isport/shared'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'

const { locale, localeProperties, t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const preventIndexing = runtimeConfig.public.siteEnv !== 'production'

// 异步布局完成水合后再刷新资料；受保护页沿用 SSR 门禁的结果。
onNuxtReady(refreshSessionAfterMount)

useHead(() => ({
  htmlAttrs: { lang: localeProperties.value.language ?? locale.value },
}))

const antdLocale = computed(() => (resolveDataLocale(locale.value) === 'en-US' ? enUS : zhCN))

// 每次生成新图标节点，避免 Modal 销毁重开时复用已卸载的默认 VNode。
const modalConfig = { closeIcon: () => h(AppModalCloseIcon) }

useSeoMeta({
  titleTemplate: title => (title ? `${title} - ${t('seo.siteName')}` : t('seo.siteName')),
  robots: preventIndexing ? 'noindex, nofollow, noarchive' : undefined,
})
</script>

<template>
  <AConfigProvider :locale="antdLocale" :theme="{ token: antdvThemeToken }" :modal="modalConfig">
    <AApp class="min-h-screen">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <LoginModal />
      <NicknameGuide />
      <LogoutConfirm />
      <LingyueAuthorize />
    </AApp>
  </AConfigProvider>
</template>
