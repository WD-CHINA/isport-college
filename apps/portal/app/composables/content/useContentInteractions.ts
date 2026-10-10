import type { Ref } from 'vue'
import type { InteractionKind, WebContentDetail } from '@isport/shared'
import { useAcademy } from '~/composables/useAcademy'
import { useAuthGate } from '~/composables/auth/useAuthGate'
import { useAuthStore } from '~/stores/auth'

interface ContentInteractionOptions {
  detail: Readonly<Ref<WebContentDetail | undefined>>
  update: (detail: WebContentDetail) => void
  refresh: () => Promise<unknown>
}

/** 点赞、收藏与登录后的操作回放；旧会话响应不能修改当前内容。 */
export function useContentInteractions(options: ContentInteractionOptions) {
  const academy = useAcademy()
  const auth = useAuthStore()
  const { requireAuth } = useAuthGate()
  const nuxt = useNuxtApp()
  const pending = shallowRef(false)
  const interactionFailed = shallowRef(false)
  let disposed = false

  async function refresh() {
    if (!pending.value && !disposed) await options.refresh()
  }

  async function setInteraction(kind: InteractionKind, active: boolean) {
    if (pending.value || disposed) return
    if (!auth.isLoggedIn) {
      await requireAuth({
        reason: 'interaction',
        onSuccess: async () => {
          await nextTick()
          if (disposed || !auth.isLoggedIn) return
          await options.refresh()
          if (!disposed) await setInteraction(kind, active)
        },
      })
      return
    }
    const detail = options.detail.value
    if (!detail) return
    if ((kind === 'like' ? detail.liked : detail.favorited) === active) return

    const revision = auth.revision
    pending.value = true
    interactionFailed.value = false
    try {
      const target = { channel: detail.channel, origin: detail.origin, originId: detail.originId }
      const result = kind === 'like' ? await academy.like(target) : await academy.favorite(target)
      if (disposed || revision !== auth.revision) return
      const current = options.detail.value
      if (!current || current.contentKey !== detail.contentKey) return
      options.update({
        ...current,
        ...(kind === 'like'
          ? { liked: result.active, likeCount: result.count }
          : { favorited: result.active, favoriteCount: result.count }),
      })
      nuxt.runWithContext(() => clearNuxtData(key => key.startsWith('academy:activity:')))
    } catch {
      if (!disposed && revision === auth.revision) interactionFailed.value = true
    } finally {
      pending.value = false
    }
  }

  onScopeDispose(() => {
    disposed = true
  })
  return { pending, interactionFailed, setInteraction, refresh }
}
