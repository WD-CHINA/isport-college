/** 窗口重新聚焦时查询服务端，跨页面不保留失效内容。 */
export function useRefreshOnFocus(refresh: () => unknown) {
  const run = () => {
    if (document.visibilityState === 'visible') void refresh()
  }
  onMounted(() => window.addEventListener('focus', run))
  onScopeDispose(() => {
    if (import.meta.client) window.removeEventListener('focus', run)
  })
}
