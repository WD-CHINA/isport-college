import { useRefreshOnFocus } from '~/composables/useRefreshOnFocus'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthStore } from '~/stores/auth'
import { apiErrorCode } from '~/api/errors'
import type { ContentStats, WebContentDetail } from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'
import { useContentInteractions } from './useContentInteractions'
import { useContentView } from './useContentView'

export function useContentDetail(id: string, channel: 'resource' | 'research' | 'school') {
  const academy = useAcademy()
  const auth = useAuthStore()
  const { t, locale } = useI18n()
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
  const detail = computed(() => request.data.value?.detail)
  function update(detail: WebContentDetail) {
    request.data.value = { detail }
  }
  const interactions = useContentInteractions({ detail, update, refresh: () => request.refresh() })
  const views = useContentView({ detail, update, status: request.status, error: request.error })

  // 推荐在浏览器独立加载，失败或超时都不影响正文 SSR。
  const recommendations = useAsyncData(
    () => `${key.value}:recommendations`,
    async (_app, { signal }) => {
      const content = detail.value
      if (!content) return []
      return academy.recommend(
        {
          channel: content.channel,
          origin: content.origin,
          originId: content.originId,
          categoryCode: content.channel === 'RESOURCE' ? undefined : content.categoryCode,
          limit: 4,
        },
        signal,
      )
    },
    { server: false, default: () => [], watch: [() => detail.value?.contentKey] },
  )
  const notFound = computed(() => {
    const error = request.error.value
    return error?.statusCode === 404 || apiErrorCode(error) === 'NOT_FOUND'
  })
  const stats = computed<ContentStats | undefined>(() => {
    const content = detail.value
    if (!content) return undefined
    return {
      views: content.viewCount,
      likes: content.likeCount,
      favorites: content.favoriteCount,
      liked: content.liked,
      favorited: content.favorited,
    }
  })
  useRefreshOnFocus(interactions.refresh)
  return {
    request,
    recommendations,
    stats,
    notFound,
    ...interactions,
    ...views,
  }
}
