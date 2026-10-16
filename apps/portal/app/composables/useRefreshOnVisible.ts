/** 页面从后台恢复可见时查询服务端，不因菜单操作或普通窗口聚焦刷新。 */
export function useRefreshOnVisible(refresh: () => unknown) {
  let wasHidden = false
  const run = () => {
    const hidden = document.visibilityState === 'hidden'
    const returned = wasHidden && !hidden
    wasHidden = hidden
    if (returned) void refresh()
  }
  onMounted(() => {
    wasHidden = document.visibilityState === 'hidden'
    document.addEventListener('visibilitychange', run)
  })
  onScopeDispose(() => {
    if (import.meta.client) document.removeEventListener('visibilitychange', run)
  })
}
