import { createAcademyClient, type AcademyClient } from '~/api/academy'
import { createRequest } from '~/api/request'
import { toWebProfile } from '~/utils/profile'
import { useAuthStore } from '~/stores/auth'
import { LOCALE_URL_CODES } from '@isport/shared'
import { createAcademyDataClient } from '~/utils/academy-data'
declare module '#app' {
  interface NuxtApp {
    $academy?: AcademyClient
  }
}

/** 界面语言以路由为准：`/en` 为英文，其余路径为中文。不读取语言 cookie。 */
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
  const route = nuxtApp.$router.currentRoute

  const configuredBase = useRuntimeConfig().public.apiBase
  const requestURL = useRequestURL()
  // 同源地址由开发代理或 Nginx 转发；绝对地址按配置直连。
  const request = createRequest({
    baseURL: new URL(configuredBase || '/', requestURL).origin,
    getToken: () => auth.session?.token,
    getLocale: () => localeFromPath(import.meta.server ? requestURL.pathname : route.value.path),
    onUnauthorized: token => auth.clearSessionIfTokenMatches(token),
  })
  const academy = createAcademyDataClient(createAcademyClient(request))
  nuxtApp.provide('academy', academy)
  return academy
}

/** 已登录时用 /me 刷新资料。失败则保留本地会话，不阻断页面渲染。 */
export async function ensureAcademySession() {
  const academy = useAcademy()
  const auth = useAuthStore()
  const token = auth.session?.token
  if (!token) return
  try {
    const signal = AbortSignal.timeout(2_000)
    const profile = toWebProfile(await academy.me(undefined, signal))
    if (profile) auth.updateUser(profile, token)
  } catch {
    // 401 已由请求层清会话。其余失败保留 cookie 中的资料。
  }
}
