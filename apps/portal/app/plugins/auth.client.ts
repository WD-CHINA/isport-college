/**
 * 客户端启动时恢复登录会话。
 * 必须在插件阶段同步执行：Nuxt 插件先于路由初始导航运行，
 * 可保证 /admin 门禁中间件读取到恢复后的登录态。
 */
export default defineNuxtPlugin(() => {
  useAuthStore().restore()
})
