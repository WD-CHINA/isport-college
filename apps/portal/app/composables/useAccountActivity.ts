import type { ContentChannel, InteractionKind } from '@isport/shared'

export function useAccountActivity() {
  const academy = useAcademy()
  const auth = useAuthStore()
  const kind = shallowRef<InteractionKind>('favorite')
  const channel = shallowRef<ContentChannel | ''>('')
  const page = shallowRef(1)
  const removing = shallowRef('')
  const failed = shallowRef(false)
  let disposed = false
  const key = computed(
    () => `academy:activity:${auth.user?.id}:${kind.value}:${channel.value}:${page.value}`,
  )
  const request = useAsyncData(key, (_app, { signal }) =>
    academy.call(
      'interaction/list',
      {
        kind: kind.value,
        channel: channel.value || undefined,
        page: page.value,
        pageSize: 12,
      },
      signal,
    ),
  )
  // 直接派生自 request.data：SSR 等待数据解析后渲染、客户端复用同一 payload，
  // 避免用 watcher 同步默认值造成首帧计数不一致的水合告警。
  const totals = computed(() => request.data.value?.totals ?? { like: 0, favorite: 0 })
  function filter(nextKind: InteractionKind, nextChannel: ContentChannel | '') {
    kind.value = nextKind
    channel.value = nextChannel
    page.value = 1
    failed.value = false
  }
  async function remove(id: string) {
    if (removing.value) return
    const token = auth.session?.token
    const removedKind = kind.value
    removing.value = id
    failed.value = false
    try {
      await academy.call('interaction/set', { id, kind: removedKind, active: false })
      if (disposed || auth.session?.token !== token) return
      await request.refresh()
      if (request.data.value?.list.length === 0 && page.value > 1) page.value--
    } catch {
      if (!disposed && auth.session?.token === token) failed.value = true
    } finally {
      removing.value = ''
    }
  }
  useRefreshOnFocus(() => request.refresh())
  onScopeDispose(() => {
    disposed = true
  })
  return { kind, channel, page, removing, failed, totals, request, filter, remove }
}
