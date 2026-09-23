import type { createHttpClient } from '@isport/api-client'

/** HTTP 客户端实例类型（复用 api-client 的包体解包与 ApiError 契约） */
export type HttpClient = ReturnType<typeof createHttpClient>

/** 每个 Nuxt 实例独立注入客户端，SSR 不跨请求共享用户会话。 */
export function useApi(): HttpClient {
  return useNuxtApp().$academyHttp
}
