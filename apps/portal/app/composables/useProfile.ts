import { useAcademy } from '~/composables/useAcademy'
import { useAuthStore } from '~/stores/auth'
import { isApiError } from '~/api/errors'
import type { WebProfile } from '@isport/shared'

export function useProfile() {
  const auth = useAuthStore()
  const academy = useAcademy()
  const { t, locale } = useI18n()
  const pending = shallowRef(false)
  const error = shallowRef('')
  let disposed = false
  onScopeDispose(() => {
    disposed = true
  })

  function fail(cause: unknown) {
    error.value =
      isApiError(cause) && locale.value === 'zh' ? cause.message : t('academy.requestFailed')
  }

  async function update(request: () => Promise<WebProfile>) {
    if (pending.value || disposed || !auth.isLoggedIn) return false
    pending.value = true
    error.value = ''
    const token = auth.session?.token
    const revision = auth.revision
    try {
      const profile = await request()
      return !disposed && revision === auth.revision && auth.updateUser(profile, token)
    } catch (cause) {
      if (!disposed && revision === auth.revision) fail(cause)
      return false
    } finally {
      pending.value = false
    }
  }

  function save(value: { nickname: string }) {
    return update(() => academy.updateNickname(value))
  }

  function saveAvatar(avatarCode: number) {
    return update(() => academy.updateAvatar({ avatarCode }))
  }

  async function skipNickname() {
    if (pending.value || !auth.user) return false
    pending.value = true
    error.value = ''
    const token = auth.session?.token
    const user = auth.user
    try {
      await academy.dismissNicknamePrompt()
      const profile: WebProfile = { ...user, nicknamePromptNeeded: false }
      return auth.updateUser(profile, token)
    } catch (cause) {
      fail(cause)
      return false
    } finally {
      pending.value = false
    }
  }

  return { pending, error, save, saveAvatar, skipNickname }
}
