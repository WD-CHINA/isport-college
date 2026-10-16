import { useRefreshOnVisible } from '~/composables/useRefreshOnVisible'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthStore } from '~/stores/auth'
import { apiErrorCode } from '~/api/errors'
import type { ContentChannel, InteractionKind } from '@isport/shared'
import { loadAccountActions } from '~/utils/account-activity'
import { toWebChannel } from '~/utils/web-channel'

export function useAccountActivity(options: { onRemoved?: (kind: InteractionKind) => void } = {}) {
  const academy = useAcademy()
  const auth = useAuthStore()
  const nuxt = useNuxtApp()
  const { locale } = useI18n()
  const kind = shallowRef<InteractionKind>('favorite')
  const channel = shallowRef<ContentChannel | ''>('')
  const page = shallowRef(1)
  const removing = shallowRef('')
  const failed = shallowRef(false)
  let disposed = false
  onScopeDispose(() => {
    disposed = true
  })
  const key = computed(() => `academy:activity:${locale.value}:${auth.user?.id}:${auth.revision}`)
  const request = useAsyncData(key, async (_app, { signal }) => {
    const load = (action: 'LIKE' | 'FAVORITE') =>
      loadAccountActions(pageNum => academy.actions({ action, pageNum, pageSize: 50 }, signal))
    const [like, favorite] = await Promise.all([load('LIKE'), load('FAVORITE')])
    return { like, favorite }
  })
  const totals = computed(() => ({
    like: request.data.value?.like.length ?? 0,
    favorite: request.data.value?.favorite.length ?? 0,
  }))
  const filtered = computed(() => {
    const items = request.data.value?.[kind.value] ?? []
    const selected = channel.value ? toWebChannel(channel.value) : undefined
    return selected ? items.filter(item => item.channel === selected) : items
  })
  const total = computed(() => filtered.value.length)
  const items = computed(() => filtered.value.slice((page.value - 1) * 12, page.value * 12))
  watch(total, count => {
    page.value = Math.min(page.value, Math.max(1, Math.ceil(count / 12)))
  })
  function filter(nextKind: InteractionKind, nextChannel: ContentChannel | '') {
    kind.value = nextKind
    channel.value = nextChannel
    page.value = 1
    failed.value = false
  }
  async function remove(contentKey: string) {
    if (removing.value || disposed) return
    const item = items.value.find(row => row.contentKey === contentKey)
    if (!item) return
    const revision = auth.revision
    const requestKey = key.value
    const removedKind = kind.value
    const current = () => !disposed && revision === auth.revision && requestKey === key.value
    removing.value = contentKey
    failed.value = false
    try {
      const target = { channel: item.channel, origin: item.origin, originId: item.originId }
      const result =
        removedKind === 'like' ? await academy.like(target) : await academy.favorite(target)
      if (!current()) return
      if (result.active) {
        failed.value = true
        await request.refresh()
        return
      }
      const data = request.data.value
      if (data)
        request.data.value = {
          ...data,
          [removedKind]: data[removedKind].filter(row => row.contentKey !== contentKey),
        }
      nuxt.runWithContext(() =>
        clearNuxtData(
          cacheKey =>
            cacheKey.startsWith('academy:detail:') ||
            (cacheKey.startsWith('academy:activity:') && cacheKey !== key.value),
        ),
      )
      options.onRemoved?.(removedKind)
    } catch (cause) {
      if (!current()) return
      if (apiErrorCode(cause) === 'NOT_FOUND') await request.refresh()
      else failed.value = true
    } finally {
      removing.value = ''
    }
  }
  useRefreshOnVisible(() => request.refresh())
  return { kind, channel, page, removing, failed, totals, items, total, request, filter, remove }
}
