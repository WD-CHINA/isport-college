import type { InteractionKind, WebChannel, WebContentCard } from '@isport/shared'
import { toWebChannel } from '~/utils/web-channel'

export function useAccountActivity() {
  const academy = useAcademy()
  const auth = useAuthStore()
  const kind = shallowRef<InteractionKind>('favorite')
  const channel = shallowRef<'resource' | 'research' | 'school' | ''>('')
  const page = shallowRef(1)
  const removing = shallowRef('')
  const failed = shallowRef(false)
  const remoteChannel = computed<WebChannel | undefined>(() =>
    channel.value ? toWebChannel(channel.value) : undefined,
  )
  const key = computed(
    () => `academy:activity:${auth.user?.id}:${kind.value}:${channel.value}:${page.value}`,
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
    if (removing.value) return
    const item = request.data.value?.list.find(row => row.contentKey === contentKey)
    if (!item) return
    removing.value = contentKey
    failed.value = false
    try {
      const target = { channel: item.channel, origin: item.origin, originId: item.originId }
      if (kind.value === 'like') await academy.like(target)
      else await academy.favorite(target)
      await request.refresh()
      if (request.data.value?.list.length === 0 && page.value > 1) page.value--
    } catch {
      failed.value = true
    } finally {
      removing.value = ''
    }
  }
  useRefreshOnFocus(() => request.refresh())
  return { kind, channel, page, removing, failed, totals, request, filter, remove }
}

export type ActivityCard = WebContentCard
