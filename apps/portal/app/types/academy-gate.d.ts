import type { AcademyRouteGate } from '@isport/shared'

/**
 * 路由门禁元数据的类型声明。
 *
 * 页面用 `definePageMeta({ academyGate: { permission, phase, auth } })` 声明所需能力，
 * 由 `app/middleware/access.global.ts` 统一执行，不再依赖路径字符串前缀判断区域。
 */
declare module 'nuxt/app' {
  interface PageMeta {
    academyGate?: AcademyRouteGate
  }
}

declare module '#app' {
  interface PageMeta {
    academyGate?: AcademyRouteGate
  }
}

export {}
