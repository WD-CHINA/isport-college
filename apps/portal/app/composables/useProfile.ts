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

  function fail(cause: unknown) {
    error.value =
      isApiError(cause) && locale.value === 'zh' ? cause.message : t('academy.requestFailed')
  }

  async function save(value: { nickname: string; avatarCode: number }) {
    if (pending.value) return false
    pending.value = true
    error.value = ''
    const token = auth.session?.token
    try {
      const nickname = await academy.updateNickname({ nickname: value.nickname })
      if (!auth.updateUser(nickname, token)) return false
      const profile = await academy.updateAvatar({ avatarCode: value.avatarCode })
      return auth.updateUser(profile, token)
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

  return { pending, error, save, skipNickname }
}
