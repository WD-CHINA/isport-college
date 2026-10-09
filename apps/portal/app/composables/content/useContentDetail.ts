import { useRefreshOnFocus } from '~/composables/useRefreshOnFocus'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthGate } from '~/composables/auth/useAuthGate'
import { useAuthStore } from '~/stores/auth'
import { apiErrorCode } from '~/api/errors'
import type { ContentStats, InteractionKind, WebContentDetail } from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'

export function useContentDetail(id: string, channel: 'resource' | 'research' | 'school') {
  const academy = useAcademy()
  const auth = useAuthStore()
  const { requireAuth } = useAuthGate()
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
    () =>
      `academy:detail:${locale.value}:${channel}:${id}:${auth.user?.id ?? 'guest'}:${auth.revision}`,
  )
  const request = useAsyncData(key, async (_app, { signal }) => {
    if (!originId) throw createError({ statusCode: 404, statusMessage: t('detail.notFound') })
    const detail = await academy.content(remoteChannel, originId, signal)
    return { detail }
  })
  // 推荐在浏览器独立加载，失败或超时都不影响正文 SSR。
  const recommendations = useAsyncData(
    () => `${key.value}:recommendations`,
    async (_app, { signal }) => {
      const detail = request.data.value?.detail
      if (!detail) return []
      return academy.recommend(
        {
          channel: detail.channel,
          origin: detail.origin,
          originId: detail.originId,
          categoryCode: detail.channel === 'RESOURCE' ? undefined : detail.categoryCode,
          limit: 4,
        },
        signal,
      )
    },
    { server: false, default: () => [], watch: [() => request.data.value?.detail.contentKey] },
  )
  const notFound = computed(() => {
    const error = request.error.value
    return error?.statusCode === 404 || apiErrorCode(error) === 'NOT_FOUND'
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
    const revision = auth.revision
    try {
      await academy.view({
        channel: detail.channel,
        origin: detail.origin,
        originId: detail.originId,
      })
      const current = request.data.value?.detail
      if (
        !disposed &&
        current &&
        revision === auth.revision &&
        current.contentKey === detail.contentKey
      )
        patch({ ...current, viewCount: current.viewCount + 1 })
      viewFailed.value = false
    } catch {
      reported = false
      if (!disposed && revision === auth.revision) viewFailed.value = true
    }
  }
  async function refresh() {
    if (!pending.value && !disposed) await request.refresh()
  }
  async function setInteraction(kind: InteractionKind, active: boolean) {
    if (pending.value || disposed) return
    if (!auth.isLoggedIn) {
      await requireAuth({
        reason: 'interaction',
        onSuccess: async () => {
          await nextTick()
          if (disposed || !auth.isLoggedIn) return
          await request.refresh()
          if (!disposed) await setInteraction(kind, active)
        },
      })
      return
    }
    const detail = request.data.value?.detail
    if (!detail) return
    if ((kind === 'like' ? detail.liked : detail.favorited) === active) return
    const revision = auth.revision
    pending.value = true
    interactionFailed.value = false
    try {
      const target = {
        channel: detail.channel,
        origin: detail.origin,
        originId: detail.originId,
      }
      const result = kind === 'like' ? await academy.like(target) : await academy.favorite(target)
      if (disposed || revision !== auth.revision) return
      const current = request.data.value?.detail
      if (!current || current.contentKey !== detail.contentKey) return
      patch({
        ...current,
        ...(kind === 'like'
          ? { liked: result.active, likeCount: result.count }
          : { favorited: result.active, favoriteCount: result.count }),
      })
      nuxt.runWithContext(() => clearNuxtData(cacheKey => cacheKey.startsWith('academy:activity:')))
    } catch {
      if (!disposed && revision === auth.revision) interactionFailed.value = true
    } finally {
      pending.value = false
    }
  }
  onMounted(() => {
    void reportView()
  })
  watch(request.status, status => {
    if (import.meta.client && status === 'success' && !viewFailed.value) void reportView()
  })
  onScopeDispose(() => {
    disposed = true
  })
  useRefreshOnFocus(refresh)
  return {
    request,
    recommendations,
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
