import type { message } from 'antdv-next'
import type { MaybeRefOrGetter } from 'vue'

/** 将响应状态转换为消息；挂载后才显示 SSR 首屏错误，状态清除时关闭对应消息。 */
export function useMessageFeedback(
  api: ReturnType<typeof message.useMessage>[0],
  source: MaybeRefOrGetter<unknown>,
  content: () => string,
  type: 'error' | 'warning' = 'error',
) {
  const key = useId()
  const mounted = shallowRef(false)
  onMounted(() => {
    mounted.value = true
  })
  watch(
    [mounted, () => toValue(source)],
    ([ready, value]) => {
      if (!ready) return
      if (value) api.open({ key, type, content: content() })
      else api.destroy(key)
    },
    { flush: 'sync' },
  )
  onScopeDispose(() => api.destroy(key))
}
