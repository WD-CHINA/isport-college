import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref, shallowRef, watch } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../app/stores/auth'
import {
  ensureAcademySession,
  refreshSessionAfterMount,
  useAcademy,
} from '../app/composables/useAcademy'
import { useLoginUiStore } from '../app/stores/login-ui'
import { useSessionActions } from '../app/composables/auth/useSessionActions'

const profile = (id: number) => ({
  id,
  phoneMask: '138****8000',
  nickname: `用户${id}`,
  avatarCode: 1,
  nicknamePromptNeeded: false,
})
const session = (id: number) => ({ token: `token-${id}`, profile: profile(id), newUser: false })
let current: ReturnType<typeof context>
function context(id: number) {
  const pinia = createPinia()
  const cookie = ref<unknown>(`token-${id}`)
  const profileState = ref<unknown>(null)
  const meDone = ref(false)
  const fetch = vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ status: 200, message: 'OK', data: profile(id) })),
  )
  const nuxt: Record<string, unknown> = {
    $pinia: pinia,
    $router: { currentRoute: ref({ path: '/resources' }) },
    isHydrating: false,
    runWithContext: (fn: () => unknown) => fn(),
    provide: (name: string, value: unknown) => {
      nuxt[`$${name}`] = value
    },
  }
  return { pinia, cookie, profileState, meDone, fetch, nuxt }
}
function activate(value: ReturnType<typeof context>) {
  current = value
  setActivePinia(value.pinia)
  vi.stubGlobal('fetch', value.fetch)
}
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>(done => {
    resolve = done
  })
  return { promise, resolve }
}

beforeEach(() => {
  vi.stubGlobal('computed', computed)
  vi.stubGlobal('shallowRef', shallowRef)
  vi.stubGlobal('watch', watch)
  vi.stubGlobal('useCookie', () => current.cookie)
  vi.stubGlobal('useState', (key?: string) =>
    key === 'ic-auth-me-done' ? current.meDone : current.profileState,
  )
  vi.stubGlobal('useNuxtApp', () => current.nuxt)
  vi.stubGlobal('useRuntimeConfig', () => ({
    apiBase: 'http://localhost:3200',
    public: { apiBase: 'http://localhost:3200', siteEnv: 'test' },
  }))
  vi.stubGlobal('useRequestURL', () => new URL('http://localhost/en/resources'))
  vi.stubGlobal('clearNuxtData', vi.fn())
  vi.stubGlobal('navigateTo', vi.fn())
  activate(context(1))
})

describe('请求与会话隔离', () => {
  it.each(['', '/', 'http://browser-api.example/'])(
    'SSR 始终使用固定上游，不受浏览器配置 %s 或入站 Host 影响',
    async apiBase => {
      vi.stubGlobal('useRuntimeConfig', () => ({
        apiBase: 'http://server-api.example',
        public: { apiBase, siteEnv: 'test' },
      }))
      vi.stubGlobal('useRequestURL', () => new URL('https://untrusted.example/en/resources'))
      await useAcademy().me()
      const [url, init] = current.fetch.mock.calls[0]!
      expect(String(url)).toBe('http://server-api.example/api/v1/me')
      expect(init?.credentials).toBe('omit')
      expect(new Headers(init?.headers).get('cookie')).toBeNull()
      expect(new Headers(init?.headers).get('authorization')).toBe('Bearer token-1')
    },
  )
  it('交错 SSR 请求的 401 只清除自己的 Pinia 会话', async () => {
    const a = current
    const delayed = deferred<Response>()
    a.fetch.mockImplementation(() => delayed.promise)
    const authA = useAuthStore(a.pinia)
    const clientA = useAcademy()
    const pending = clientA.me()
    const rejected = expect(pending).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    const b = context(2)
    activate(b)
    const authB = useAuthStore(b.pinia)
    useAcademy()
    delayed.resolve(
      new Response(JSON.stringify({ status: 401, message: 'expired', data: null }), {
        status: 401,
      }),
    )
    await rejected
    expect(authA.session).toBeNull()
    expect(authB.session?.token).toBe('token-2')
    expect(new Headers(a.fetch.mock.calls[0]?.[1]?.headers).get('authorization')).toBe(
      'Bearer token-1',
    )
    expect(new Headers(a.fetch.mock.calls[0]?.[1]?.headers).get('x-locale')).toBe('en-US')
  })
  it('旧请求的 401 与资料更新不会清掉或覆盖新登录', async () => {
    const delayed = deferred<Response>()
    current.fetch.mockImplementation(() => delayed.promise)
    const auth = useAuthStore()
    const pending = useAcademy().me()
    const rejected = expect(pending).rejects.toMatchObject({ code: 'UNAUTHORIZED' })
    auth.setSession(session(2))
    delayed.resolve(new Response(JSON.stringify({ status: 401, message: 'expired', data: null })))
    await rejected
    expect(auth.updateUser(profile(1), 'token-1')).toBe(false)
    expect(auth.session?.token).toBe('token-2')
    expect(auth.user?.id).toBe(2)
  })
  it('匿名请求的晚到 401 不清除已登录会话', () => {
    const auth = useAuthStore()
    auth.clearSessionIfTokenMatches(undefined)
    expect(auth.session?.token).toBe('token-1')
  })
  it('主动清理与令牌匹配清理有明确的独立行为', () => {
    const auth = useAuthStore()
    auth.clearSessionIfTokenMatches('old-token')
    expect(auth.session?.token).toBe('token-1')
    auth.clearSessionIfTokenMatches('token-1')
    expect(auth.session).toBeNull()
    auth.setSession(session(2))
    auth.clearSession()
    expect(auth.session).toBeNull()
  })
  it('水合阶段不重复请求 SSR 已刷新的 /me', async () => {
    useAuthStore()
    current.meDone.value = true
    current.nuxt.isHydrating = true
    await ensureAcademySession()
    expect(current.fetch).not.toHaveBeenCalled()
  })
  it('公开页挂载仍请求一次 /me，受保护页挂载沿用 SSR 结果', async () => {
    useAuthStore()
    refreshSessionAfterMount()
    await vi.waitFor(() => expect(current.fetch).toHaveBeenCalledTimes(1))
    expect(String(current.fetch.mock.calls[0]?.[0])).toContain('/api/v1/me')
    current.fetch.mockClear()
    current.meDone.value = true
    refreshSessionAfterMount()
    expect(current.fetch).not.toHaveBeenCalled()
  })
  it('令牌不进入 Pinia SSR payload', () => {
    const auth = useAuthStore()
    expect(auth.isLoggedIn).toBe(true)
    expect(JSON.stringify(current.pinia.state.value)).not.toContain('token-1')
    expect(JSON.stringify(current.pinia.state.value)).not.toContain('profile')
  })
  it('普通学苑资料不授予管理权限', () => {
    const auth = useAuthStore()
    expect(auth.can('account:view')).toBe(true)
    expect(auth.can('admin:view')).toBe(false)
    expect(auth.can('creation:use')).toBe(false)
  })
  it('其他标签页退出后立即清理内存会话与私有数据', () => {
    const auth = useAuthStore()
    current.cookie.value = null
    expect(auth.session).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
    expect(auth.revision).toBe(1)
    expect(clearNuxtData).toHaveBeenCalledTimes(1)
  })
  it('其他标签页切换账号后，请求使用新令牌并拒绝旧资料响应', async () => {
    const auth = useAuthStore()
    const client = useAcademy()
    current.cookie.value = 'token-2'
    expect(auth.user).toBeNull()
    expect(auth.session?.token).toBe('token-2')
    expect(auth.revision).toBe(1)
    expect(auth.updateUser(profile(1), 'token-1')).toBe(false)
    await client.me()
    expect(new Headers(current.fetch.mock.calls[0]?.[1]?.headers).get('authorization')).toBe(
      'Bearer token-2',
    )
  })
  it('资料更新只写内存，Cookie 保持令牌', () => {
    const auth = useAuthStore()
    auth.setSession(session(1))
    expect(current.cookie.value).toBe('token-1')
    expect(auth.updateUser({ ...profile(1), nickname: '新昵称' }, 'token-1')).toBe(true)
    expect(auth.user?.nickname).toBe('新昵称')
    expect(auth.revision).toBe(1)
    expect(current.cookie.value).toBe('token-1')
    expect(clearNuxtData).toHaveBeenCalledTimes(1)
  })
  it('整包 Cookie 无效，不建立会话', () => {
    current.cookie.value = session(1)
    const auth = useAuthStore()
    expect(current.cookie.value).toBeNull()
    expect(auth.session).toBeNull()
    expect(auth.revision).toBe(0)
  })
  it('其他标签页写入无效 Cookie 后，不保留旧令牌', () => {
    const auth = useAuthStore()
    current.cookie.value = { token: 'invalid', profile: { id: -1 } }
    expect(auth.session).toBeNull()
    expect(auth.revision).toBe(1)
  })
  it('关闭登录弹窗后晚到的登录响应不能建立会话', async () => {
    const auth = useAuthStore()
    auth.clearSession()
    const delayed = deferred<unknown>()
    current.nuxt.$academy = { login: () => delayed.promise }
    const ui = useLoginUiStore()
    ui.openLoginModal()
    const { login } = useSessionActions()
    const pending = login({ phone: '13800138000', code: '123456', agreed: true })
    ui.closeLoginModal()
    delayed.resolve(session(2))
    expect(await pending).toBeNull()
    expect(auth.session).toBeNull()
  })
  it('晚到的退出响应不能清除新的会话', async () => {
    const auth = useAuthStore()
    const delayed = deferred<unknown>()
    current.nuxt.$academy = { logout: () => delayed.promise }
    const { logout } = useSessionActions()
    const pending = logout()
    auth.setSession(session(2))
    delayed.resolve(null)
    await pending
    expect(auth.session?.token).toBe('token-2')
  })
})
