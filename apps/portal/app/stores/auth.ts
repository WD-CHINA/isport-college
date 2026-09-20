import { login as loginApi, logout as logoutApi, type LoginPayload } from '~/api/auth'
import { AUTH_COOKIE_NAME, AUTH_SESSION_TTL } from '@isport/shared'
import type { AuthSession } from '@isport/shared'

export type AuthGateReason = 'enroll' | 'admin' | 'default'

/** 登录意图：登录成功后恢复的目标路由或操作 */
export interface LoginIntent {
  reason: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

export const useAuthStore = defineStore('auth', () => {
  /**
   * 真实登录会话保存在可由 SSR 读取的 Cookie 中，默认有效期 7 天。
   * token 由后端 `/rsp/user/login` 签发，按后端约定直接作为 Authorization 头值使用。
   */
  const sessionCookie = useCookie<AuthSession | null>(AUTH_COOKIE_NAME, {
    maxAge: AUTH_SESSION_TTL,
    path: '/',
    sameSite: 'lax',
  })
  const session = shallowRef<AuthSession | null>(sessionCookie.value ?? null)

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
    const next = await loginApi(payload)
    session.value = next
    sessionCookie.value = next
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

  /** 仅清理本地会话（401 响应时由 HTTP 层调用，不再发起 logout 请求） */
  function clearSession() {
    session.value = null
    sessionCookie.value = null
  }

  /** 显式退出登录：后端失效 token 无论如何都清理本地会话 */
  async function logout() {
    try {
      await logoutApi()
    } finally {
      clearSession()
    }
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
    logout,
    clearSession,
    resolveLoginSuccess,
  }
})
