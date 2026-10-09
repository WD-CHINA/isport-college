import { isAdminRoutePath, isPrivateRoutePath } from '@isport/shared'

/**
 * 管理端与私有路由的 HTTP 层处理：
 * - 统一输出 noindex
 * - 管理端强制 CSR
 */
export default defineEventHandler(event => {
  const admin = isAdminRoutePath(event.path)
  if (!admin && !isPrivateRoutePath(event.path)) return

  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')

  if (admin) {
    const context = event.context as { nuxt?: { noSSR?: boolean } }
    context.nuxt = context.nuxt ?? {}
    context.nuxt.noSSR = true
  }
})
