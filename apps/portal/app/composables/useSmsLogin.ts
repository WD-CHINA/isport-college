import type { SmsChallenge } from '~/api/auth'
import { isApiError } from '@isport/api-client'

export function useSmsLogin() {
  const auth = useAuthStore()
  const academy = useAcademy()
  const { t, locale } = useI18n()
  const form = reactive({ phone: '', code: '', agreed: false })
  const challenge = shallowRef<SmsChallenge | null>(null)
  const sending = shallowRef(false)
  const submitting = shallowRef(false)
  const error = shallowRef('')
  const now = shallowRef(0)
  const retryAt = shallowRef(0)
  const remaining = computed(() => Math.max(0, Math.ceil((retryAt.value - now.value) / 1000)))
  let timer: ReturnType<typeof setInterval> | undefined
  let generation = 0
  const challenges = new Map<string, { challenge: SmsChallenge; retryAt: number }>()
  const errorText = (cause: unknown) =>
    isApiError(cause) && locale.value === 'zh' ? cause.message : t('academy.requestFailed')

  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now()
    }, 500)
  })
  onScopeDispose(() => {
    clearInterval(timer)
    generation++
  })
  watch(
    () => form.phone,
    phone => {
      const previous = challenges.get(phone)
      challenge.value = previous?.challenge ?? null
      retryAt.value = previous?.retryAt ?? 0
      now.value = Date.now()
      form.code = ''
      error.value = ''
      generation++
    },
  )
  watch(
    () => auth.loginModalVisible,
    visible => {
      generation++
      error.value = ''
      if (!visible) form.code = ''
    },
  )

  async function send() {
    if (sending.value || remaining.value > 0) return
    error.value = ''
    if (!/^1\d{10}$/.test(form.phone)) {
      error.value = t('academy.phoneInvalid')
      return
    }
    const request = generation
    const phone = form.phone
    sending.value = true
    try {
      const next = await academy.call('auth/challenge', { phone })
      const expires = Date.now() + next.retryAfter * 1000
      challenges.set(phone, { challenge: next, retryAt: expires })
      if (request !== generation) return
      challenge.value = next
      now.value = Date.now()
      retryAt.value = expires
    } catch (cause) {
      if (request === generation) error.value = errorText(cause)
    } finally {
      sending.value = false
    }
  }

  async function submit() {
    if (submitting.value) return
    error.value = ''
    if (!/^1\d{10}$/.test(form.phone)) {
      error.value = t('academy.phoneInvalid')
      return
    }
    if (!challenge.value || !/^\d{6}$/.test(form.code)) {
      error.value = t('academy.codeInvalid')
      return
    }
    if (!form.agreed) {
      error.value = t('academy.agreeRequired')
      return
    }
    const request = generation
    submitting.value = true
    try {
      const session = await auth.login({
        phone: form.phone,
        code: form.code,
        challengeId: challenge.value.id,
        agreed: form.agreed,
      })
      if (session && request === generation) await auth.resolveLoginSuccess()
    } catch (cause) {
      if (request === generation) error.value = errorText(cause)
    } finally {
      submitting.value = false
    }
  }
  return { form, challenge, sending, submitting, error, remaining, send, submit }
}
