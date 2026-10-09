import type { AcademyRouteGate, Permission } from '@isport/shared'

/** 登录与权限门禁。管理端未声明权限时默认要求 `admin:view`。 */
export default defineNuxtRouteMiddleware((to, from) => {
  useAcademy()
  const gate: AcademyRouteGate = to.meta.academyGate ?? {}
  const adminArea = isAdminRoute(to)
  const permission: Permission | undefined =
    gate.permission ?? (adminArea ? 'admin:view' : undefined)
  if (gate.auth !== true && permission === undefined) return

  const auth = useAuthStore()
  if (auth.isLoggedIn) {
    if (permission && !auth.can(permission))
      throw createError({ statusCode: 403, message: 'FORBIDDEN' })
    return
  }
  if (import.meta.server) return
  auth.openLoginModal({ reason: adminArea ? 'admin' : 'account', redirect: to.fullPath })
  if (from.name != null) return abortNavigation()
  return navigateTo(useLocalePath()('/'))
})
