import { LOCALE_STORAGE_KEY } from '@isport/shared'

/**
 * 语言偏好持久化到 localStorage（不再使用 Cookie）。
 * SSR 首屏恒为默认语言；客户端 hydration 完成后恢复用户偏好并跳转对应语言路由，
 * 避免 hydration mismatch（恢复时首屏语言会切换一次，属预期行为）。
 */
export default defineNuxtPlugin(nuxtApp => {
  const { $i18n } = nuxtApp
  const switchLocalePath = useSwitchLocalePath()

  // 用户切换语言时写入偏好（不用 immediate，避免恢复前覆盖已存偏好）
  watch($i18n.locale, code => {
    localStorage.setItem(LOCALE_STORAGE_KEY, code)
  })

  // 必须等 hydration（含 Suspense）全部完成再恢复语言跳转：
  // 否则未 hydrate 完的组件会按新语言渲染，与 SSR 输出产生全站 mismatch
  onNuxtReady(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    const isValid = $i18n.locales.value.some(item => item.code === stored)
    if (stored && isValid && stored !== $i18n.locale.value) {
      void navigateTo(switchLocalePath(stored as typeof $i18n.locale.value))
    }
  })
})
