<script setup lang="ts">
import { useSiteSeo } from '~/composables/useSiteSeo'
import { refreshSessionAfterMount } from '~/composables/useAcademy'
import LoginModal from '~/components/auth/LoginModal.vue'
import LogoutConfirm from '~/components/auth/LogoutConfirm.vue'
import NicknameGuide from '~/components/auth/NicknameGuide.vue'
import LingyueAuthorize from '~/components/auth/LingyueAuthorize.vue'
import AppModalCloseIcon from '~/components/app/AppModalCloseIcon.vue'
import AppNetworkStatus from '~/components/app/AppNetworkStatus.vue'
import { antdvThemeToken } from '@isport/design-tokens/antdv-theme'
import { resolveDataLocale } from '@isport/shared'
import enUS from 'antdv-next/locale/en_US'
import zhCN from 'antdv-next/locale/zh_CN'

const { locale, localeProperties } = useI18n()

// 异步布局完成水合后再刷新资料；受保护页沿用 SSR 门禁的结果。
onNuxtReady(refreshSessionAfterMount)

useHead(() => ({
  htmlAttrs: { lang: localeProperties.value.language ?? locale.value },
}))

const antdLocale = computed(() => (resolveDataLocale(locale.value) === 'en-US' ? enUS : zhCN))

// 每次生成新图标节点，避免 Modal 销毁重开时复用已卸载的默认 VNode。
const modalConfig = { closeIcon: () => h(AppModalCloseIcon) }

// 组件库同样沿用全站透明度反馈，选中项继续使用品牌色。
const themeConfig = {
  token: antdvThemeToken,
  components: {
    Pagination: {
      colorBgTextHover: 'transparent',
      colorBgTextActive: 'transparent',
      colorPrimaryHover: antdvThemeToken.colorPrimary,
      itemActiveColorHover: antdvThemeToken.colorPrimary,
    },
    Tabs: {
      itemHoverColor: antdvThemeToken.colorTextBase,
      itemActiveColor: antdvThemeToken.colorTextBase,
    },
  },
}

useSiteSeo()
</script>

<template>
  <AConfigProvider
    :locale="antdLocale"
    :theme="themeConfig"
    :modal="modalConfig"
    :wave="{ disabled: true }"
  >
    <AApp class="min-h-screen">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <AppNetworkStatus />
      <LoginModal />
      <NicknameGuide />
      <LogoutConfirm />
      <LingyueAuthorize />
    </AApp>
  </AConfigProvider>
</template>
