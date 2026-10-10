import { defineStore } from 'pinia'
import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_TTL,
  hasWebPermission,
  type Permission,
  type WebSession,
} from '@isport/shared'
import { toWebProfile } from '~/utils/profile'

/** 仅管理会话与权限；接口调用、弹窗和导航由调用侧编排。 */
export const useAuthStore = defineStore('auth', () => {
  const nuxt = useNuxtApp()
  const config = useRuntimeConfig()
  const sessionCookie = useCookie<WebSession | null>(AUTH_COOKIE_NAME, {
    maxAge: AUTH_SESSION_TTL,
    path: '/',
    sameSite: 'lax',
    secure: config.public.siteEnv === 'production',
  })
  const candidate = sessionCookie.value
  const profile = toWebProfile(candidate?.profile)
  const valid =
    profile &&
    typeof candidate?.token === 'string' &&
    candidate.token.length > 0 &&
    candidate.token.length <= 3072
  const storedSession = shallowRef<WebSession | null>(
    valid ? { token: candidate!.token, profile, newUser: candidate!.newUser === true } : null,
  )
  if (candidate && !valid) sessionCookie.value = null
  const revision = shallowRef(0)
  // 令牌仍由直连接口所需的 Cookie 提供；computed 不进入 Pinia 的 SSR state。
  const session = computed(() => storedSession.value)
  const user = computed(() => storedSession.value?.profile ?? null)
  const isLoggedIn = computed(() => storedSession.value !== null)

  function invalidateData() {
    nuxt.runWithContext(() =>
      clearNuxtData(
        key => key.startsWith('academy:detail:') || key.startsWith('academy:activity:'),
      ),
    )
  }
  function setSession(value: WebSession) {
    revision.value++
    storedSession.value = value
    sessionCookie.value = value
    invalidateData()
  }
  function updateUser(value: unknown, expectedToken: string | undefined) {
    const profile = toWebProfile(value)
    if (!profile || !storedSession.value || storedSession.value.token !== expectedToken)
      return false
    storedSession.value = { ...storedSession.value, profile }
    sessionCookie.value = storedSession.value
    return true
  }
  function clearSession() {
    if (!storedSession.value) return
    revision.value++
    storedSession.value = null
    sessionCookie.value = null
    invalidateData()
  }
  /** 只清理发起请求的会话；匿名请求和旧令牌不能影响新登录。 */
  function clearSessionIfTokenMatches(expectedToken: string | undefined) {
    if (storedSession.value?.token === expectedToken) clearSession()
  }
  function can(permission: Permission) {
    return hasWebPermission(user.value, permission)
  }
  return {
    session,
    user,
    isLoggedIn,
    revision: computed(() => revision.value),
    can,
    setSession,
    updateUser,
    clearSession,
    clearSessionIfTokenMatches,
  }
})
