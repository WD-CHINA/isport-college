import { isApiError } from '~/api/errors'
import type { ContentStats, InteractionKind, WebContentDetail } from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'

export function useContentDetail(id: string, channel: 'resource' | 'research' | 'school') {
  const academy = useAcademy()
  const auth = useAuthStore()
  const nuxt = useNuxtApp()
  const { t, locale } = useI18n()
  const pending = shallowRef(false)
  const interactionFailed = shallowRef(false)
  const viewFailed = shallowRef(false)
  let disposed = false
  let reported = false
  const remoteChannel = toWebChannel(channel)
  const originId = /^[1-9]\d{0,15}$/.test(id) ? Number(id) : 0
  const key = computed(
    () => `academy:detail:${locale.value}:${channel}:${id}:${auth.user?.id ?? 'guest'}`,
  )
  const request = useAsyncData(key, async (_app, { signal }) => {
    if (!originId) throw createError({ statusCode: 404, statusMessage: t('detail.notFound') })
    const detail = await academy.content(remoteChannel, originId, signal)
    const recommendations = await academy.recommend(
      {
        channel: detail.channel,
        origin: detail.origin,
        originId: detail.originId,
        categoryCode: detail.channel === 'RESOURCE' ? undefined : detail.categoryCode,
        limit: 4,
      },
      signal,
    )
    return { detail, recommendations }
  })
  const notFound = computed(() => {
    const error = request.error.value
    return error?.statusCode === 404 || (isApiError(error) && error.code === 'NOT_FOUND')
  })
  const stats = computed<ContentStats | undefined>(() => {
    const detail = request.data.value?.detail
    if (!detail) return undefined
    return {
      views: detail.viewCount,
      likes: detail.likeCount,
      favorites: detail.favoriteCount,
      liked: detail.liked,
      favorited: detail.favorited,
    }
  })
  function patch(detail: WebContentDetail) {
    if (request.data.value) request.data.value = { ...request.data.value, detail }
  }
  async function reportView() {
    const detail = request.data.value?.detail
    if (reported || !detail || request.error.value || disposed) return
    reported = true
    try {
      await academy.view({
        channel: detail.channel,
        origin: detail.origin,
        originId: detail.originId,
      })
      if (!disposed) patch({ ...detail, viewCount: detail.viewCount + 1 })
      viewFailed.value = false
    } catch {
      reported = false
      if (!disposed) viewFailed.value = true
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
        onSuccess: () => {
          if (!disposed) return setInteraction(kind, active)
        },
      })
      return
    }
    const detail = request.data.value?.detail
    if (!detail) return
    pending.value = true
    interactionFailed.value = false
    try {
      const target = {
        channel: detail.channel,
        origin: detail.origin,
        originId: detail.originId,
      }
      const result = kind === 'like' ? await academy.like(target) : await academy.favorite(target)
      if (disposed) return
      patch({
        ...detail,
        ...(kind === 'like'
          ? { liked: result.active, likeCount: result.count }
          : { favorited: result.active, favoriteCount: result.count }),
      })
      nuxt.runWithContext(() => clearNuxtData(cacheKey => cacheKey.startsWith('academy:activity:')))
    } catch {
      if (!disposed) interactionFailed.value = true
    } finally {
      pending.value = false
    }
  }
  onMounted(() => {
    void reportView()
  })
  watch(request.status, status => {
    if (status === 'success' && !viewFailed.value) void reportView()
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
