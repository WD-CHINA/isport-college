import type { LoginPayload } from '@isport/api-client'
import type { AuthSession } from '@isport/shared'
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from '@isport/shared'

export type AuthGateReason = 'enroll' | 'admin' | 'default'

/** 登录意图：登录成功后恢复的目标路由或操作 */
export interface LoginIntent {
  reason: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

export const useAuthStore = defineStore('auth', () => {
  /** Cookie 是 SSR 与客户端共享登录状态的来源，默认有效期 7 天 */
  const authCookie = useCookie<AuthSession | null>(AUTH_COOKIE_NAME, {
    maxAge: AUTH_COOKIE_MAX_AGE,
    sameSite: 'lax',
    default: () => null,
  })

  const session = shallowRef<AuthSession | null>(authCookie.value)

  const user = computed(() => session.value?.user ?? null)
  const isLoggedIn = computed(() => session.value !== null)
  const isAdmin = computed(() => user.value?.roles.includes('admin') ?? false)

  /** 全局唯一登录弹窗状态（仅客户端使用，SSR 初始输出不受影响） */
  const loginModalVisible = shallowRef(false)
  const loginIntent = shallowRef<LoginIntent | null>(null)

  function openLoginModal(intent?: LoginIntent) {
    loginIntent.value = intent ?? null
    loginModalVisible.value = true
  }

  /** 关闭弹窗表示取消当前受保护操作 */
  function closeLoginModal() {
    loginModalVisible.value = false
    loginIntent.value = null
  }

  async function login(payload: LoginPayload) {
    const { $authRepository } = useNuxtApp()
    const next = await $authRepository.login(payload)
    session.value = next
    authCookie.value = next
    return next
  }

  /** 登录成功：恢复路由或受保护操作 */
  async function resolveLoginSuccess() {
    const intent = loginIntent.value
    closeLoginModal()
    if (intent?.redirect) {
      await navigateTo(intent.redirect)
    }
    await intent?.onSuccess?.()
  }

  /** 显式退出登录：清理 Cookie 与内存状态 */
  async function logout() {
    const { $authRepository } = useNuxtApp()
    await $authRepository.logout()
    session.value = null
    authCookie.value = null
  }

  return {
    session,
    user,
    isLoggedIn,
    isAdmin,
    loginModalVisible,
    loginIntent,
    openLoginModal,
    closeLoginModal,
    login,
    resolveLoginSuccess,
    logout,
  }
})
