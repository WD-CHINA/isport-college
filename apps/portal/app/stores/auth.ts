import { defineStore } from 'pinia'
import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_TTL,
  hasWebPermission,
  type Permission,
  type WebProfile,
  type WebSession,
} from '@isport/shared'
import { toWebProfile } from '~/utils/profile'
import { useAuthCacheStore } from './auth-cache'

const AUTH_PERSIST_KEY = 'ic_auth'

interface AuthState {
  token: string
  profile: WebProfile | null
  newUser: boolean
}

function normalizeToken(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const token = value.trim()
  if (!token || token.length > 3072) return null
  return token
}

function readPersistedAuth(token: string): AuthState | null {
  if (!import.meta.client) return null
  const cache = useAuthCacheStore()
  const profile = toWebProfile(cache.profile)
  if (!profile || cache.token !== token) return null
  return { token, profile, newUser: cache.newUser === true }
}

function writePersistedAuth(value: AuthState & { profile: WebProfile }) {
  if (!import.meta.client) return
  const cache = useAuthCacheStore()
  cache.$patch({
    token: value.token,
    newUser: value.newUser,
    profile: value.profile,
  })
}

function clearPersistedAuth() {
  if (!import.meta.client) return
  const cache = useAuthCacheStore()
  cache.$patch({ token: '', profile: null, newUser: false })
}

/** 仅管理会话与权限；接口调用、弹窗和导航由调用侧编排。 */
export const useAuthStore = defineStore('auth', () => {
  const nuxt = useNuxtApp()
  const config = useRuntimeConfig()
  const sessionCookie = useCookie<string | null>(AUTH_COOKIE_NAME, {
    maxAge: AUTH_SESSION_TTL,
    path: '/',
    sameSite: 'lax',
    secure: config.public.siteEnv === 'production',
  })
  // 本次 SSR 已解析的资料，随 payload 交给水合；不放入令牌。
  const renderedProfile = useState<WebProfile | null>('ic-auth-profile', () => null)
  const accepted = normalizeToken(sessionCookie.value)
  if (sessionCookie.value != null && sessionCookie.value !== accepted)
    sessionCookie.value = accepted
  const storedSession = shallowRef<AuthState | null>(
    accepted
      ? { token: accepted, profile: toWebProfile(renderedProfile.value), newUser: false }
      : null,
  )
  const revision = shallowRef(0)
  // computed 不进入 Pinia 的 SSR state，令牌不会进到页面 payload。
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
  function applyToken(nextToken: string | null) {
    const previous = storedSession.value
    if (nextToken === previous?.token) return
    if (!nextToken) {
      if (!previous) return
      storedSession.value = null
      renderedProfile.value = null
      clearPersistedAuth()
      revision.value++
      invalidateData()
      return
    }
    const cached = import.meta.client && !nuxt.isHydrating ? readPersistedAuth(nextToken) : null
    storedSession.value = cached ?? { token: nextToken, profile: null, newUser: false }
    renderedProfile.value = cached?.profile ?? null
    revision.value++
    invalidateData()
  }
  function restorePersistedAuth() {
    const current = storedSession.value
    if (!current || current.profile) return
    const cached = readPersistedAuth(current.token)
    if (!cached) return
    storedSession.value = cached
    renderedProfile.value = cached.profile
  }
  function syncFromPersistedStorage() {
    if (!import.meta.client) return
    const cache = useAuthCacheStore()
    cache.$hydrate?.({ runHooks: false })
    const current = storedSession.value
    if (!current) return
    const cached = readPersistedAuth(current.token)
    if (!cached) {
      if (current.profile) {
        storedSession.value = { ...current, profile: null, newUser: false }
        renderedProfile.value = null
      }
      return
    }
    if (
      cached.profile?.id === current.profile?.id &&
      cached.profile?.nickname === current.profile?.nickname &&
      cached.profile?.avatarCode === current.profile?.avatarCode &&
      cached.profile?.lingyueBound === current.profile?.lingyueBound &&
      cached.newUser === current.newUser
    ) {
      return
    }
    storedSession.value = cached
    renderedProfile.value = cached.profile
  }
  // 其他标签页退出或换令牌时同步；资料本身不在 Cookie 里。
  watch(
    sessionCookie,
    candidate => {
      const nextToken = normalizeToken(candidate)
      if (candidate != null && candidate !== nextToken) {
        sessionCookie.value = nextToken
        return
      }
      applyToken(nextToken)
    },
    { flush: 'sync' },
  )
  if (import.meta.client) {
    // 根应用 mounted 时异步布局仍可能在水合，等 Nuxt 完整水合后再恢复客户端资料。
    onNuxtReady(restorePersistedAuth)
    window.addEventListener('storage', event => {
      if (event.key !== AUTH_PERSIST_KEY) return
      syncFromPersistedStorage()
    })
  }
  function setSession(value: WebSession) {
    const profile = toWebProfile(value.profile)
    if (!profile || !normalizeToken(value.token)) return
    const next: AuthState & { profile: WebProfile } = {
      token: value.token,
      profile,
      newUser: value.newUser === true,
    }
    revision.value++
    storedSession.value = next
    renderedProfile.value = profile
    writePersistedAuth(next)
    sessionCookie.value = next.token
    invalidateData()
  }
  function updateUser(value: unknown, expectedToken: string | undefined) {
    const profile = toWebProfile(value)
    const current = storedSession.value
    if (!profile || !current || current.token !== expectedToken) return false
    const next = { token: current.token, profile, newUser: current.newUser }
    storedSession.value = next
    renderedProfile.value = profile
    writePersistedAuth(next)
    return true
  }
  function clearSession() {
    if (!storedSession.value) return
    revision.value++
    storedSession.value = null
    renderedProfile.value = null
    clearPersistedAuth()
    sessionCookie.value = null
    invalidateData()
  }
  /** 只清理发起请求的会话；匿名请求和旧令牌不能影响新登录。 */
  function clearSessionIfTokenMatches(expectedToken: string | undefined) {
    if (storedSession.value?.token === expectedToken) clearSession()
  }
  function can(permission: Permission) {
    if (!storedSession.value) return false
    // 令牌已建立前台会话。资料未从缓存或 /me 补齐时，个人中心仍可进入。
    if (permission === 'account:view') return true
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
