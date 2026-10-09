import { ensureAcademySession } from '~/composables/useAcademy'
import { isAdminRoute } from '~/utils/route-gate'
import { useAcademy } from '~/composables/useAcademy'
import { useLoginUiStore } from '~/stores/login-ui'
import { useAuthStore } from '~/stores/auth'
import type { AcademyRouteGate, Permission } from '@isport/shared'

/** 登录与权限门禁。管理端未声明权限时默认要求 `admin:view`。 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  useAcademy()
  const gate: AcademyRouteGate = to.meta.academyGate ?? {}
  const adminArea = isAdminRoute(to)
  const permission: Permission | undefined =
    gate.permission ?? (adminArea ? 'admin:view' : undefined)
  if (gate.auth !== true && permission === undefined) return

  const auth = useAuthStore()
  const loginUi = useLoginUiStore()
  if (auth.isLoggedIn) await ensureAcademySession()
  if (auth.isLoggedIn) {
    if (permission && !auth.can(permission))
      throw createError({ statusCode: 403, message: 'FORBIDDEN' })
    return
  }
  if (import.meta.server) return
  loginUi.openLoginModal({ reason: adminArea ? 'admin' : 'account', redirect: to.fullPath })
  if (from.name != null) return abortNavigation()
  return navigateTo(useLocalePath()('/'))
})
