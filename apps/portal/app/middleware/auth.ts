/**
 * 路由登录门禁：访问管理端等受保护页面时触发。
 * 未登录时保留目标地址并打开登录弹窗，登录成功后继续进入目标页面。
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  if (auth.isLoggedIn) return

  auth.openLoginModal({ reason: 'admin', redirect: to.fullPath })

  // 应用内跳转：中止并停留在当前页；直接访问：先回到首页等待登录
  if (from.name != null) {
    return abortNavigation()
  }
  const localePath = useLocalePath()
  return navigateTo(localePath('/'))
})
