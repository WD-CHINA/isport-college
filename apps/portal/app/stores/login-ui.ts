import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export type AuthGateReason = 'admin' | 'default' | 'interaction' | 'account'
export interface LoginIntent {
  reason: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

/** 跨页面登录交互状态，与令牌和业务请求分离。 */
export const useLoginUiStore = defineStore('login-ui', () => {
  const nuxt = useNuxtApp()
  const auth = useAuthStore(nuxt.$pinia)
  const loginModalVisible = shallowRef(false)
  const nicknameGuideVisible = shallowRef(false)
  const logoutConfirmVisible = shallowRef(false)
  const loginIntent = shallowRef<LoginIntent | null>(null)
  const revision = shallowRef(0)
  function openLoginModal(intent?: LoginIntent) {
    revision.value++
    loginIntent.value = intent ?? null
    loginModalVisible.value = true
  }
  function closeLoginModal() {
    revision.value++
    loginModalVisible.value = false
    loginIntent.value = null
  }
  async function resolveLoginSuccess() {
    const intent = loginIntent.value
    closeLoginModal()
    if (intent?.redirect?.startsWith('/') && !intent.redirect.startsWith('//')) {
      await nuxt.runWithContext(() => navigateTo(intent.redirect!))
    }
    await intent?.onSuccess?.()
  }
  watch(
    () => auth.session?.token,
    () => {
      nicknameGuideVisible.value = false
      logoutConfirmVisible.value = false
      if (!auth.isLoggedIn) closeLoginModal()
    },
    { flush: 'sync' },
  )
  return {
    loginModalVisible,
    nicknameGuideVisible,
    logoutConfirmVisible,
    loginIntent,
    revision,
    openLoginModal,
    closeLoginModal,
    resolveLoginSuccess,
  }
})
