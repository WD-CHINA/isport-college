import type { LingyueLaunchRequest, LingyueLaunchTarget } from '@isport/shared'
import { ApiError, isApiError } from '~/api/errors'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthGate } from '~/composables/auth/useAuthGate'
import { useAuthStore } from '~/stores/auth'

const AUTHORIZE_OPEN = 'ic-lingyue-authorize'
const LAUNCH_REQUEST = 'ic-lingyue-launch'
const LAUNCH_ERROR = 'ic-lingyue-error'
const LAUNCH_PENDING = 'ic-lingyue-pending'

export interface LingyueEntry {
  target: LingyueLaunchTarget
  agentCode?: string
}

function toLaunch(value: unknown) {
  if (typeof value !== 'object' || value === null) return null
  const row = value as Record<string, unknown>
  const launchUrl = typeof row.launchUrl === 'string' ? row.launchUrl.trim() : ''
  if (!launchUrl.startsWith('https://')) return null
  return { launchUrl, lingyueBound: row.lingyueBound === true }
}

/** 已登录后换取灵跃一次性地址；未关联时先确认授权。 */
export function useLingyueLaunch() {
  const auth = useAuthStore()
  const academy = useAcademy()
  const { requireAuth } = useAuthGate()
  const { t, locale } = useI18n()
  const authorizeOpen = useState(AUTHORIZE_OPEN, () => false)
  const launchRequest = useState<LingyueEntry | null>(LAUNCH_REQUEST, () => null)
  const error = useState(LAUNCH_ERROR, () => '')
  const pending = useState(LAUNCH_PENDING, () => false)

  function fail(cause: unknown) {
    error.value =
      isApiError(cause) && locale.value === 'zh' ? cause.message : t('academy.requestFailed')
  }

  async function requestLaunch(body: LingyueLaunchRequest, revision: number) {
    const token = auth.session?.token
    if (!token || revision !== auth.revision) return false
    const result = toLaunch(await academy.launchLingyue(body))
    if (revision !== auth.revision || token !== auth.session?.token) return false
    if (!result) throw ApiError.serviceUnavailable(t('academy.requestFailed'))
    if (result.lingyueBound && auth.user) {
      auth.updateUser({ ...auth.user, lingyueBound: true }, token)
    }
    window.open(result.launchUrl, '_blank', 'noopener,noreferrer')
    return true
  }

  function openLingyue(entry: LingyueEntry) {
    error.value = ''
    void requireAuth({
      onSuccess: async () => {
        if (auth.user?.lingyueBound) {
          if (pending.value) return
          const revision = auth.revision
          pending.value = true
          try {
            await requestLaunch(entry, revision)
          } catch (cause) {
            if (revision === auth.revision) fail(cause)
          } finally {
            if (revision === auth.revision) pending.value = false
          }
          return
        }
        launchRequest.value = entry
        authorizeOpen.value = true
      },
    })
  }

  async function confirmAuthorize() {
    const entry = launchRequest.value
    if (!entry || pending.value) return
    const revision = auth.revision
    pending.value = true
    error.value = ''
    try {
      if (await requestLaunch({ ...entry, authorized: true }, revision)) {
        authorizeOpen.value = false
        launchRequest.value = null
      }
    } catch (cause) {
      if (revision === auth.revision) fail(cause)
    } finally {
      if (revision === auth.revision) pending.value = false
    }
  }

  function cancelAuthorize() {
    authorizeOpen.value = false
    launchRequest.value = null
    error.value = ''
  }

  watch(
    () => auth.revision,
    () => {
      cancelAuthorize()
      pending.value = false
    },
    { flush: 'sync' },
  )

  return {
    authorizeOpen,
    pending,
    error,
    openLingyue,
    confirmAuthorize,
    cancelAuthorize,
  }
}
