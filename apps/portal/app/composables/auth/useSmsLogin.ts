import { useAcademy } from '~/composables/useAcademy'
import { useSessionActions } from '~/composables/auth/useSessionActions'
import { useLoginUiStore } from '~/stores/login-ui'
import { isApiError } from '~/api/errors'

export function useSmsLogin(options: { onSent?: () => void; onSuccess?: () => void } = {}) {
  const loginUi = useLoginUiStore()
  const academy = useAcademy()
  const { login } = useSessionActions()
  const { t, locale } = useI18n()
  const form = reactive({ phone: '', code: '', agreed: false })
  const sent = shallowRef(false)
  const sending = shallowRef(false)
  const submitting = shallowRef(false)
  const error = shallowRef('')
  const remaining = shallowRef(0)
  let timer: ReturnType<typeof setInterval> | undefined
  let requestId = 0

  const fail = (cause: unknown) => {
    error.value =
      isApiError(cause) && locale.value === 'zh' ? cause.message : t('academy.requestFailed')
  }

  function clearTimer() {
    if (timer) clearInterval(timer)
    timer = undefined
  }

  function reset() {
    requestId++
    clearTimer()
    form.phone = ''
    form.code = ''
    form.agreed = false
    sent.value = false
    remaining.value = 0
    error.value = ''
  }

  function startCooldown(seconds = 60) {
    clearTimer()
    remaining.value = seconds
    timer = setInterval(() => {
      remaining.value -= 1
      if (remaining.value <= 0) clearTimer()
    }, 1000)
  }

  onScopeDispose(clearTimer)

  watch(
    () => form.phone,
    () => {
      requestId++
      sent.value = false
      form.code = ''
      error.value = ''
      remaining.value = 0
      clearTimer()
    },
  )

  watch(
    () => loginUi.loginModalVisible,
    visible => {
      requestId++
      error.value = ''
      if (!visible) reset()
    },
  )

  async function send() {
    if (sending.value || remaining.value > 0) return
    error.value = ''
    if (!/^1\d{10}$/.test(form.phone)) {
      error.value = t('academy.phoneInvalid')
      return
    }
    const id = ++requestId
    sending.value = true
    try {
      await academy.sendSms({ phone: form.phone })
      if (id !== requestId) return
      sent.value = true
      startCooldown()
      options.onSent?.()
    } catch (cause) {
      if (id === requestId) fail(cause)
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
    if (!sent.value || !/^\d{6}$/.test(form.code)) {
      error.value = t('academy.codeInvalid')
      return
    }
    if (!form.agreed) {
      error.value = t('academy.agreeRequired')
      return
    }
    const id = ++requestId
    submitting.value = true
    try {
      const session = await login({
        phone: form.phone,
        code: form.code,
        agreed: form.agreed,
      })
      if (session && id === requestId) {
        reset()
        options.onSuccess?.()
        await loginUi.resolveLoginSuccess()
      }
    } catch (cause) {
      if (id === requestId) fail(cause)
    } finally {
      submitting.value = false
    }
  }

  return { form, sent, sending, submitting, error, remaining, send, submit }
}
