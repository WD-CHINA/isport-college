/**
 * 路由登录门禁：访问管理端等受保护页面时触发。
 * 未登录时保留目标地址并打开登录弹窗，登录成功后继续进入目标页面。
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  const path = to.path.replace(/^\/en(?=\/|$)/, '')
  // 创作中心（概览/我的创作/我的积分）虽并入 /admin 路由，但面向教师，仅需登录，不校验运营权限。
  const creation = /^\/admin\/(creation|works|points)(?:\/|$)/.test(path)
  const admin = !creation && (path === '/admin' || path.startsWith('/admin/'))
  if (auth.isLoggedIn) {
    if (admin && !(path.startsWith('/admin/reviews') ? auth.canReview : auth.canOperate)) {
      throw createError({ statusCode: 403, message: 'FORBIDDEN' })
    }
    return
  }

  if (import.meta.server) return
  auth.openLoginModal({ reason: admin ? 'admin' : 'account', redirect: to.fullPath })

  // 应用内跳转：中止并停留在当前页；直接访问：先回到首页等待登录
  if (from.name != null) {
    return abortNavigation()
  }
  const localePath = useLocalePath()
  return navigateTo(localePath('/'))
})
