import type { ContentChannel, ContentStats, InteractionKind } from '@isport/shared'
import { isApiError } from '@isport/api-client'

export function useContentDetail(id: string, channel: ContentChannel) {
  const academy = useAcademy()
  const auth = useAuthStore()
  const nuxt = useNuxtApp()
  const { t } = useI18n()
  const pending = shallowRef(false)
  const interactionFailed = shallowRef(false)
  const viewFailed = shallowRef(false)
  const mounted = shallowRef(false)
  let disposed = false
  let eventId = ''
  let reported = false
  let reporting = false
  let mutation = 0
  const key = computed(() => `academy:detail:${channel}:${id}:${auth.user?.id ?? 'guest'}`)
  const request = useAsyncData(key, async (_app, { signal }) => {
    const value = await academy.call('content/detail', { id }, signal)
    if (value.content.channel !== channel)
      throw createError({ statusCode: 404, statusMessage: t('detail.notFound') })
    return value
  })
  const notFound = computed(() => {
    const error = request.error.value
    return error?.statusCode === 404 || (isApiError(error) && error.code === 'NOT_FOUND')
  })
  const stats = computed(() => request.data.value?.stats)
  function applyStats(value: ContentStats) {
    if (request.data.value) request.data.value = { ...request.data.value, stats: value }
  }
  async function reportView() {
    if (
      !mounted.value ||
      reported ||
      reporting ||
      !request.data.value ||
      request.error.value ||
      disposed
    )
      return
    reporting = true
    eventId ||= crypto.randomUUID()
    try {
      const value = await academy.call('content/view', { id, eventId })
      reported = true
      if (!disposed && stats.value) applyStats({ ...stats.value, views: value.views })
      viewFailed.value = false
    } catch {
      if (!disposed) viewFailed.value = true
    } finally {
      reporting = false
    }
  }
  async function refresh() {
    if (!pending.value && !disposed) await request.refresh()
  }
  async function setInteraction(kind: InteractionKind, active: boolean) {
    if (pending.value || disposed) return
    if (!auth.isLoggedIn) {
      auth.openLoginModal({
        reason: 'interaction',
        onSuccess: async () => {
          if (!disposed) {
            await request.refresh()
            await setInteraction(kind, active)
          }
        },
      })
      return
    }
    const token = auth.session?.token
    const current = ++mutation
    pending.value = true
    interactionFailed.value = false
    try {
      // 先结束已有查询，防止旧查询覆盖新的关系状态。
      await request.refresh()
      if (disposed || auth.session?.token !== token || current !== mutation) return
      const value = await academy.call('interaction/set', { id, kind, active })
      if (!disposed && auth.session?.token === token && current === mutation) {
        applyStats(value)
        nuxt.runWithContext(() =>
          clearNuxtData(cacheKey => cacheKey.startsWith('academy:activity:')),
        )
      }
    } catch {
      if (!disposed && current === mutation && auth.session?.token === token)
        interactionFailed.value = true
    } finally {
      if (current === mutation) pending.value = false
    }
  }
  watch(
    () => auth.session?.token,
    () => {
      ++mutation
      pending.value = false
      interactionFailed.value = false
    },
    { flush: 'sync' },
  )
  watch(
    [mounted, request.status],
    () => {
      if (!viewFailed.value) void reportView()
    },
    { flush: 'post' },
  )
  onMounted(() => {
    mounted.value = true
  })
  onScopeDispose(() => {
    disposed = true
  })
  useRefreshOnFocus(refresh)
  return {
    request,
    stats,
    notFound,
    pending,
    interactionFailed,
    viewFailed,
    setInteraction,
    reportView,
    refresh,
  }
}
