import { isApiError } from '@isport/api-client'

export function useProfile() {
  const auth = useAuthStore()
  const academy = useAcademy()
  const { t, locale } = useI18n()
  const pending = ref(false)
  const error = ref('')
  async function save(value: { nickname: string; avatar: string }) {
    if (pending.value) return false
    const token = auth.session?.token
    pending.value = true
    error.value = ''
    try {
      const user = await academy.call('account/profile', value)
      auth.updateUser(user, token)
      return auth.session?.token === token
    } catch (cause) {
      error.value =
        isApiError(cause) && locale.value === 'zh' ? cause.message : t('academy.requestFailed')
      return false
    } finally {
      pending.value = false
    }
  }
  return { pending, error, save }
}
