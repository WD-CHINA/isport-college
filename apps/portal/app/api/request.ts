import { createHttpClient } from '@isport/api-client'

/** HTTP 客户端实例类型（复用 api-client 的包体解包与 ApiError 契约） */
export type HttpClient = ReturnType<typeof createHttpClient>

let client: HttpClient | undefined

/**
 * HTTP 客户端单例（无状态，可跨 SSR 请求共享）：
 * - 响应统一解包 `{ code, msg, data }`，业务/HTTP 错误统一抛 ApiError；
 * - SSR 用 NUXT_API_BASE 直连后端，浏览器用 NUXT_PUBLIC_API_BASE（'/rsp' 相对路径或完整域名）；
 * - 登录会话存于 Cookie（SSR 可读），按后端约定 Authorization 直接携带 token，无 Bearer 前缀。
 */
export function useApi(): HttpClient {
  if (client) return client

  const config = useRuntimeConfig()
  client = createHttpClient({
    baseURL: import.meta.server ? config.apiBase : config.public.apiBase,
    getHeaders: () => {
      const token = useAuthStore().session?.token
      return token ? { Authorization: token } : undefined
    },
    /** 登录失效：仅清理本地会话（不走 logout 接口，避免 401 递归），门禁由下次导航触发 */
    onUnauthorized: () => {
      useAuthStore().clearSession()
    },
  })
  return client
}
