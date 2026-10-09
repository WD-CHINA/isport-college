import { useLoginUiStore } from '~/stores/login-ui'
import { useAuthStore } from '~/stores/auth'
import type { AuthGateReason } from '~/stores/login-ui'

interface RequireAuthOptions {
  reason?: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

/**
 * 需要会话的操作门禁，通过登录 UI 保存意图。
 * 已登录直接执行；未登录打开全局登录弹窗并保存意图，登录成功后恢复。
 */
export function useAuthGate() {
  const auth = useAuthStore()
  const loginUi = useLoginUiStore()

  async function requireAuth(options: RequireAuthOptions = {}): Promise<boolean> {
    if (auth.isLoggedIn) {
      await options.onSuccess?.()
      return true
    }
    loginUi.openLoginModal({
      reason: options.reason ?? 'default',
      redirect: options.redirect,
      onSuccess: options.onSuccess,
    })
    return false
  }

  return { requireAuth }
}
