import { createAcademyClient, type AcademyClient } from '~/api/academy'
import { createRequest } from '~/api/request'
import { toWebProfile } from '~/utils/profile'
import { useAuthStore } from '~/stores/auth'
import { LOCALE_URL_CODES, resolveDataLocale } from '@isport/shared'
import { createAcademyDataClient } from '~/utils/academy-data'
import { resolveBrowserApiBase } from '~/utils/api-url'
declare module '#app' {
  interface NuxtApp {
    $academy?: AcademyClient
  }
}

/** SSR 数据语言以路由为准：`/en` 为英文，其余路径为中文。不读取语言 cookie。 */
function localeFromPath(path: string) {
  return (
    LOCALE_URL_CODES[path.split('/')[1]?.toLowerCase() as keyof typeof LOCALE_URL_CODES] ??
    LOCALE_URL_CODES.zh
  )
}

/**
 * 当前请求的学苑客户端。在 setup 或路由中间件中调用。
 * 同一次 Nuxt 请求内复用；鉴权只使用当前会话的 Bearer。
 * 令牌在发送时再读取，避免和登录状态互相初始化。
 */
export function useAcademy() {
  const nuxtApp = useNuxtApp()
  if (nuxtApp.$academy) return nuxtApp.$academy
  const auth = useAuthStore(nuxtApp.$pinia)

  const config = useRuntimeConfig()
  const requestURL = useRequestURL()
  // SSR 上游只能来自环境配置。浏览器绝对地址直连；空或 `/` 请求当前站点。
  const request = createRequest({
    baseURL: import.meta.server
      ? config.apiBase
      : resolveBrowserApiBase(config.public.apiBase, requestURL),
    getToken: () => auth.session?.token,
    // 客户端语言先于 currentRoute 完成切换；与 useAsyncData 的语言键读取同一来源。
    getLocale: () =>
      import.meta.server
        ? localeFromPath(requestURL.pathname)
        : resolveDataLocale(unref(nuxtApp.$i18n.locale)),
    onUnauthorized: token => auth.clearSessionIfTokenMatches(token),
  })
  const academy = createAcademyDataClient(createAcademyClient(request))
  nuxtApp.provide('academy', academy)
  return academy
}

const SESSION_REFRESHED = 'ic-auth-me-done'

/** 已登录时用 /me 刷新资料。失败则保留本地会话，不阻断页面渲染。 */
export async function ensureAcademySession() {
  const nuxt = useNuxtApp()
  const refreshed = useState(SESSION_REFRESHED, () => false)
  const auth = useAuthStore()
  const token = auth.session?.token
  if (!token) return
  // 受保护页的 SSR 已经刷新过。水合阶段的门禁不要再打一次。
  if (nuxt.isHydrating && refreshed.value) return
  const academy = useAcademy()
  try {
    const signal = AbortSignal.timeout(2_000)
    const profile = toWebProfile(await academy.me(undefined, signal))
    if (profile && auth.updateUser(profile, token)) refreshed.value = true
  } catch {
    // 401 已由请求层清会话。其余失败保留 store 中已有的资料。
  }
}

/** 公开页在浏览器挂载后补一次资料。受保护页沿用 SSR 的结果。 */
export function refreshSessionAfterMount() {
  if (useState(SESSION_REFRESHED, () => false).value) return
  void ensureAcademySession()
}
