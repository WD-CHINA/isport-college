import type { AuthGateReason } from '~/stores/auth'

interface RequireAuthOptions {
  reason?: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

/**
 * 统一登录门禁：操作门禁（收藏/报名/管理操作）与路由门禁共用入口。
 * 已登录直接执行；未登录打开全局登录弹窗并保存意图，登录成功后恢复。
 */
export function useAuthGate() {
  const auth = useAuthStore()

  async function requireAuth(options: RequireAuthOptions = {}): Promise<boolean> {
    if (auth.isLoggedIn) {
      await options.onSuccess?.()
      return true
    }
    auth.openLoginModal({
      reason: options.reason ?? 'default',
      redirect: options.redirect,
      onSuccess: options.onSuccess,
    })
    return false
  }

  return { requireAuth }
}
