import { ApiError } from '~/api/errors'
import { toWebProfile } from '~/utils/profile'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthStore } from '~/stores/auth'
import { useLoginUiStore } from '~/stores/login-ui'

export function useSessionActions() {
  const auth = useAuthStore()
  const loginUi = useLoginUiStore()
  const academy = useAcademy()
  async function login(payload: { phone: string; code: string; agreed: boolean }) {
    const uiRevision = loginUi.revision
    const sessionRevision = auth.revision
    const next = await academy.login(payload)
    const profile = toWebProfile(next?.profile)
    if (!profile || typeof next?.token !== 'string' || !next.token || next.token.length > 3072) {
      throw ApiError.serviceUnavailable('登录响应格式不正确')
    }
    if (uiRevision !== loginUi.revision || sessionRevision !== auth.revision) return null
    const session = { token: next.token, profile, newUser: next.newUser === true }
    auth.setSession(session)
    loginUi.nicknameGuideVisible = profile.nicknamePromptNeeded
    return session
  }
  async function logout() {
    const token = auth.session?.token
    try {
      await academy.logout()
    } finally {
      auth.clearSession(token)
    }
  }
  return { login, logout }
}
