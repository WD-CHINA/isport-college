import type { Ref } from 'vue'
import type { AsyncDataRequestStatus } from '#app'
import type { WebContentDetail } from '@isport/shared'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthStore } from '~/stores/auth'

interface ContentViewOptions {
  detail: Readonly<Ref<WebContentDetail | undefined>>
  status: Readonly<Ref<AsyncDataRequestStatus>>
  error: Readonly<Ref<unknown>>
  update: (detail: WebContentDetail) => void
}

/** 正文加载后上报浏览；同一次访问只计数一次，失败后允许手动重试。 */
export function useContentView(options: ContentViewOptions) {
  const academy = useAcademy()
  const auth = useAuthStore()
  const viewFailed = shallowRef(false)
  let disposed = false
  let reported = false

  async function reportView() {
    const detail = options.detail.value
    if (reported || !detail || options.error.value || disposed) return
    reported = true
    viewFailed.value = false
    const revision = auth.revision
    try {
      await academy.view({
        channel: detail.channel,
        origin: detail.origin,
        originId: detail.originId,
      })
      const current = options.detail.value
      if (
        !disposed &&
        current &&
        revision === auth.revision &&
        current.contentKey === detail.contentKey
      ) {
        options.update({ ...current, viewCount: current.viewCount + 1 })
        viewFailed.value = false
      }
    } catch {
      reported = false
      if (!disposed && revision === auth.revision) viewFailed.value = true
    }
  }

  onMounted(() => void reportView())
  watch(options.status, status => {
    if (import.meta.client && status === 'success' && !viewFailed.value) void reportView()
  })
  onScopeDispose(() => {
    disposed = true
  })
  return { viewFailed, reportView }
}
