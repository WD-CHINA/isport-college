import { isApiError } from '~/api/errors'
import type { WebProfile } from '@isport/shared'

export function useProfile() {
  const auth = useAuthStore()
  const academy = useAcademy()
  const { t, locale } = useI18n()
  const pending = shallowRef(false)
  const error = shallowRef('')

  function fail(cause: unknown) {
    error.value =
      isApiError(cause) && locale.value === 'zh' ? cause.message : t('academy.requestFailed')
  }

  async function save(value: { nickname: string; avatarCode: number }) {
    if (pending.value) return false
    pending.value = true
    error.value = ''
    try {
      await academy.updateNickname({ nickname: value.nickname })
      auth.updateUser(await academy.updateAvatar({ avatarCode: value.avatarCode }))
      return true
    } catch (cause) {
      fail(cause)
      return false
    } finally {
      pending.value = false
    }
  }

  async function skipNickname() {
    if (pending.value || !auth.user) return false
    pending.value = true
    error.value = ''
    try {
      await academy.dismissNicknamePrompt()
      const profile: WebProfile = { ...auth.user, nicknamePromptNeeded: false }
      auth.updateUser(profile)
      return true
    } catch (cause) {
      fail(cause)
      return false
    } finally {
      pending.value = false
    }
  }

  return { pending, error, save, skipNickname }
}
