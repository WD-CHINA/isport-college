import { createAcademyClient, type AcademyClient } from '~/api/academy'
import { createRequest } from '~/api/request'
import { toWebProfile } from '~/utils/profile'
declare module '#app' {
  interface NuxtApp {
    $academy?: AcademyClient
  }
}

/** 界面语言以路由为准：`/en` 为英文，其余路径为中文。不读取语言 cookie。 */
function localeFromPath(path: string) {
  return path === '/en' || path.startsWith('/en/') ? 'en-US' : 'zh-CN'
}

/**
 * 当前请求的学苑客户端。在 setup 或路由中间件中调用。
 * 同一次 Nuxt 请求内复用，服务端使用这次请求自己的 fetch。
 * 令牌在发送时再读取，避免和登录状态互相初始化。
 */
export function useAcademy() {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$academy) return nuxtApp.$academy

  const requestPath = import.meta.server ? useRequestURL().pathname : ''
  const requestFetch = import.meta.server ? useRequestEvent()?.fetch : undefined
  const fetchImpl = requestFetch
    ? (input: RequestInfo | URL, init?: RequestInit) =>
        requestFetch(input instanceof URL ? input.href : String(input), init)
    : undefined

  const academy = createAcademyClient(
    createRequest({
      baseURL: useRuntimeConfig().public.apiBase,
      getToken: () => useAuthStore().session?.token,
      getLocale: () => localeFromPath(import.meta.client ? window.location.pathname : requestPath),
      fetch: fetchImpl,
      onUnauthorized: () => useAuthStore().clearSession(),
    }),
  )
  nuxtApp.provide('academy', academy)
  return academy
}

/** 已登录时用 /me 刷新资料。失败则保留本地会话，不阻断页面渲染。 */
export async function ensureAcademySession() {
  const academy = useAcademy()
  const auth = useAuthStore()
  if (!auth.session?.token) return
  try {
    const profile = toWebProfile(await academy.me())
    if (profile) auth.updateUser(profile)
  } catch {
    // 401 已由请求层清会话。其余失败保留 cookie 中的资料。
  }
}
