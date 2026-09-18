import type { LoginPayload } from '@isport/api-client'
import type { AuthSession } from '@isport/shared'

export type AuthGateReason = 'enroll' | 'admin' | 'default'

/** 登录意图：登录成功后恢复的目标路由或操作 */
export interface LoginIntent {
  reason: AuthGateReason
  redirect?: string
  onSuccess?: () => void | Promise<void>
}

export const useAuthStore = defineStore('auth', () => {
  /**
   * 登录会话持久化在 localStorage（不再使用 Cookie），默认有效期 7 天。
   * SSR 输出恒为未登录态；@pinia/nuxt 会将该值序列化进 payload 并在客户端水合覆盖，
   * 因此初值必须为 null，由 restore() 在水合后显式恢复（见 plugins/auth.client.ts）。
   * SSR 渲染中依赖登录态的区域（如 AppHeader 用户区）需用 <ClientOnly> 隔离。
   */
  const session = shallowRef<AuthSession | null>(null)

  /** 客户端启动时从 localStorage 恢复会话；需在路由初始导航前调用，保证门禁中间件读到正确状态 */
  function restore() {
    session.value = readAuthSession()
  }

  const user = computed(() => session.value?.user ?? null)
  const isLoggedIn = computed(() => session.value !== null)
  const isAdmin = computed(() => user.value?.roles.includes('admin') ?? false)

  /** 全局唯一登录弹窗状态（仅客户端使用，SSR 初始输出不受影响） */
  const loginModalVisible = shallowRef(false)
  const loginIntent = shallowRef<LoginIntent | null>(null)

  function openLoginModal(intent?: LoginIntent) {
    loginIntent.value = intent ?? null
    loginModalVisible.value = true
  }

  /** 关闭弹窗表示取消当前受保护操作 */
  function closeLoginModal() {
    loginModalVisible.value = false
    loginIntent.value = null
  }

  async function login(payload: LoginPayload) {
    const { $authRepository } = useNuxtApp()
    const next = await $authRepository.login(payload)
    session.value = next
    writeAuthSession(next)
    return next
  }

  /** 登录成功：恢复路由或受保护操作 */
  async function resolveLoginSuccess() {
    const intent = loginIntent.value
    closeLoginModal()
    if (intent?.redirect) {
      await navigateTo(intent.redirect)
    }
    await intent?.onSuccess?.()
  }

  /** 显式退出登录：清理本地存储与内存状态 */
  async function logout() {
    const { $authRepository } = useNuxtApp()
    await $authRepository.logout()
    session.value = null
    clearAuthSession()
  }

  return {
    session,
    user,
    isLoggedIn,
    isAdmin,
    loginModalVisible,
    loginIntent,
    restore,
    openLoginModal,
    closeLoginModal,
    login,
    resolveLoginSuccess,
    logout,
  }
})
