import type { LoginPayload } from '~/api/auth'
import type { AcademySession } from '@isport/api-client'
import { AUTH_COOKIE_NAME, AUTH_SESSION_TTL } from '@isport/shared'
import type { AcademyUser, Role } from '@isport/shared'

export type AuthGateReason = 'enroll' | 'admin' | 'default' | 'interaction' | 'lingyue' | 'account'

/** 登录意图：登录成功后恢复的目标路由或操作 */
export interface LoginIntent {
  reason: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

export const useAuthStore = defineStore('auth', () => {
  const nuxt = useNuxtApp()
  let epoch = 0
  /** Cookie 仅携带演示会话；用户与权限由服务端 token 记录再次校验。 */
  const sessionCookie = useCookie<AcademySession | null>(AUTH_COOKIE_NAME, {
    maxAge: AUTH_SESSION_TTL,
    path: '/',
    sameSite: 'lax',
  })
  const candidate = sessionCookie.value
  const validShape =
    candidate &&
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    candidate.token.length <= 256 &&
    candidate.user &&
    typeof candidate.user.id === 'string' &&
    typeof candidate.user.name === 'string' &&
    typeof candidate.user.phone === 'string' &&
    typeof candidate.user.avatar === 'string' &&
    Array.isArray(candidate.user.roles) &&
    candidate.user.roles.every(role => typeof role === 'string')
  const session = shallowRef<AcademySession | null>(validShape ? candidate : null)
  if (candidate && !validShape) sessionCookie.value = null
  const nicknameGuideVisible = shallowRef(false)
  const logoutConfirmVisible = shallowRef(false)

  const user = computed(() => session.value?.user ?? null)
  const isLoggedIn = computed(() => session.value !== null)
  const isAdmin = computed(() => user.value?.roles.includes('admin') ?? false)
  const canReview = computed(() => hasRole('reviewer'))
  const canOperate = computed(() => hasRole('operator'))
  function hasRole(role: Role) {
    return isAdmin.value || (user.value?.roles.includes(role) ?? false)
  }
  function invalidatePrivateData() {
    nuxt.runWithContext(() => clearNuxtData(key => key.startsWith('academy:')))
  }

  /** 全局唯一登录弹窗状态（仅客户端使用，SSR 初始输出不受影响） */
  const loginModalVisible = shallowRef(false)
  const loginIntent = shallowRef<LoginIntent | null>(null)

  function openLoginModal(intent?: LoginIntent) {
    loginIntent.value = intent ?? null
    loginModalVisible.value = true
  }

  /** 关闭弹窗表示取消当前受保护操作 */
  function closeLoginModal() {
    epoch++
    loginModalVisible.value = false
    loginIntent.value = null
  }

  async function login(payload: LoginPayload) {
    const attempt = epoch
    const next = await nuxt.$academy.call('auth/login', payload)
    if (attempt !== epoch) return null
    invalidatePrivateData()
    session.value = next
    sessionCookie.value = next
    nicknameGuideVisible.value = next.promptNickname
    return next
  }

  function updateUser(next: AcademyUser, expectedToken = session.value?.token) {
    if (!session.value || session.value.token !== expectedToken) return
    session.value = { ...session.value, user: next }
    sessionCookie.value = session.value
  }

  /** 登录成功：恢复路由或受保护操作 */
  async function resolveLoginSuccess() {
    const intent = loginIntent.value
    closeLoginModal()
    if (intent?.redirect?.startsWith('/') && !intent.redirect.startsWith('//')) {
      await nuxt.runWithContext(() => navigateTo(intent.redirect!))
    }
    await intent?.onSuccess?.()
  }

  /** 仅清理本地会话（401 响应时由 HTTP 层调用，不再发起 logout 请求） */
  function clearSession() {
    session.value = null
    sessionCookie.value = null
    closeLoginModal()
    nicknameGuideVisible.value = false
    logoutConfirmVisible.value = false
    invalidatePrivateData()
  }

  /** 显式退出登录：后端失效 token 无论如何都清理本地会话 */
  async function logout() {
    try {
      await nuxt.$academy.call('auth/logout', {})
    } finally {
      clearSession()
    }
  }

  return {
    session,
    user,
    isLoggedIn,
    isAdmin,
    canReview,
    canOperate,
    hasRole,
    updateUser,
    nicknameGuideVisible,
    logoutConfirmVisible,
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
