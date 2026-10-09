import { ApiError } from '~/api/errors'
import { toWebProfile } from '~/utils/profile'
import { AUTH_COOKIE_NAME, AUTH_SESSION_TTL } from '@isport/shared'
import type { Permission, WebProfile, WebSession } from '@isport/shared'

export type AuthGateReason = 'enroll' | 'admin' | 'default' | 'interaction' | 'lingyue' | 'account'
export interface LoginPayload {
  phone: string
  code: string
  agreed: boolean
}

/** 登录意图：登录成功后恢复的目标路由或操作 */
export interface LoginIntent {
  reason: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

function validProfile(value: unknown): value is WebProfile {
  if (!value || typeof value !== 'object') return false
  const profile = value as WebProfile
  return (
    typeof profile.id === 'number' &&
    profile.id > 0 &&
    typeof profile.phoneMask === 'string' &&
    typeof profile.nickname === 'string' &&
    typeof profile.avatarCode === 'number' &&
    typeof profile.nicknamePromptNeeded === 'boolean'
  )
}

export const useAuthStore = defineStore('auth', () => {
  const nuxt = useNuxtApp()
  const academy = useAcademy()
  let epoch = 0
  const sessionCookie = useCookie<WebSession | null>(AUTH_COOKIE_NAME, {
    maxAge: AUTH_SESSION_TTL,
    path: '/',
    sameSite: 'lax',
  })
  const candidate = sessionCookie.value
  const validShape =
    !!candidate &&
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    candidate.token.length <= 4096 &&
    validProfile(candidate.profile)
  const session = shallowRef<WebSession | null>(validShape ? candidate : null)
  if (candidate && !validShape) sessionCookie.value = null
  const nicknameGuideVisible = shallowRef(false)
  const logoutConfirmVisible = shallowRef(false)

  const user = computed(() => session.value?.profile ?? null)
  const isLoggedIn = computed(() => session.value !== null)

  /** 前台资料接口没有角色；已登录仅开放个人中心。 */
  function can(permission: Permission) {
    return permission === 'account:view' && isLoggedIn.value
  }
  const isAdmin = computed(() => false)
  function invalidatePrivateData() {
    nuxt.runWithContext(() => clearNuxtData(key => key.startsWith('academy:')))
  }

  const loginModalVisible = shallowRef(false)
  const loginIntent = shallowRef<LoginIntent | null>(null)

  function openLoginModal(intent?: LoginIntent) {
    loginIntent.value = intent ?? null
    loginModalVisible.value = true
  }

  function closeLoginModal() {
    epoch++
    loginModalVisible.value = false
    loginIntent.value = null
  }

  async function login(payload: LoginPayload) {
    const attempt = epoch
    const next = await academy.login(payload)
    const profile = toWebProfile(next.profile)
    if (typeof next.token !== 'string' || !next.token || !profile) {
      throw ApiError.serviceUnavailable('登录响应缺少令牌')
    }
    if (attempt !== epoch) return null
    invalidatePrivateData()
    const stored: WebSession = {
      token: next.token,
      profile,
      newUser: next.newUser === true,
    }
    session.value = stored
    sessionCookie.value = stored
    nicknameGuideVisible.value = next.profile.nicknamePromptNeeded
    return stored
  }

  function updateUser(value: unknown, expectedToken = session.value?.token) {
    const profile = toWebProfile(value)
    if (!profile || !session.value || session.value.token !== expectedToken) return
    session.value = { ...session.value, profile }
    sessionCookie.value = session.value
  }

  async function resolveLoginSuccess() {
    const intent = loginIntent.value
    closeLoginModal()
    if (intent?.redirect?.startsWith('/') && !intent.redirect.startsWith('//')) {
      await nuxt.runWithContext(() => navigateTo(intent.redirect!))
    }
    await intent?.onSuccess?.()
  }

  function clearSession() {
    session.value = null
    sessionCookie.value = null
    closeLoginModal()
    nicknameGuideVisible.value = false
    logoutConfirmVisible.value = false
    invalidatePrivateData()
  }

  async function logout() {
    try {
      await academy.logout()
    } finally {
      clearSession()
    }
  }

  return {
    session,
    user,
    isLoggedIn,
    isAdmin,
    can,
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
