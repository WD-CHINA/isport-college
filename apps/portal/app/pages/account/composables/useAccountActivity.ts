import { useRefreshOnVisible } from '~/composables/useRefreshOnVisible'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthStore } from '~/stores/auth'
import type { InteractionKind, WebChannel, WebContentCard } from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'

export function useAccountActivity(options: { onRemoved?: (kind: InteractionKind) => void } = {}) {
  const academy = useAcademy()
  const auth = useAuthStore()
  const { locale } = useI18n()
  const kind = shallowRef<InteractionKind>('favorite')
  const channel = shallowRef<'resource' | 'research' | 'school' | ''>('')
  const page = shallowRef(1)
  const removing = shallowRef('')
  const failed = shallowRef(false)
  let disposed = false
  onScopeDispose(() => {
    disposed = true
  })
  const remoteChannel = computed<WebChannel | undefined>(() =>
    channel.value ? toWebChannel(channel.value) : undefined,
  )
  const key = computed(
    () =>
      `academy:activity:${locale.value}:${auth.user?.id}:${auth.revision}:${kind.value}:${channel.value}:${page.value}`,
  )
  const request = useAsyncData(key, async (_app, { signal }) => {
    const action = kind.value === 'like' ? 'LIKE' : 'FAVORITE'
    const [current, likes, favorites] = await Promise.all([
      academy.actions(
        { action, channel: remoteChannel.value, pageNum: page.value, pageSize: 12 },
        signal,
      ),
      academy.actions({ action: 'LIKE', pageNum: 1, pageSize: 1 }, signal),
      academy.actions({ action: 'FAVORITE', pageNum: 1, pageSize: 1 }, signal),
    ])
    return {
      ...current,
      totals: { like: likes.total, favorite: favorites.total },
    }
  })
  const totals = computed(() => request.data.value?.totals ?? { like: 0, favorite: 0 })
  function filter(nextKind: InteractionKind, nextChannel: 'resource' | 'research' | 'school' | '') {
    kind.value = nextKind
    channel.value = nextChannel
    page.value = 1
    failed.value = false
  }
  async function remove(contentKey: string) {
    if (removing.value || disposed) return
    const item = request.data.value?.list.find(row => row.contentKey === contentKey)
    if (!item) return
    const revision = auth.revision
    const removedKind = kind.value
    removing.value = contentKey
    failed.value = false
    try {
      const target = { channel: item.channel, origin: item.origin, originId: item.originId }
      const result =
        removedKind === 'like' ? await academy.like(target) : await academy.favorite(target)
      if (disposed || revision !== auth.revision) return
      if (!result.active) options.onRemoved?.(removedKind)
      await request.refresh()
      if (disposed || revision !== auth.revision) return
      if (request.data.value?.list.length === 0 && page.value > 1) page.value--
    } catch {
      if (!disposed && revision === auth.revision) failed.value = true
    } finally {
      removing.value = ''
    }
  }
  useRefreshOnVisible(() => request.refresh())
  return { kind, channel, page, removing, failed, totals, request, filter, remove }
}

export type ActivityCard = WebContentCard
