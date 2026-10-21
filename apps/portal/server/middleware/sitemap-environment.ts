/** 非生产环境不开放站点地图；必须在模块缓存处理之前拦截。 */
export default defineEventHandler(event => {
  const path = getRequestURL(event).pathname.toLowerCase()
  if (path !== '/sitemap.xml' && path !== '/sitemap_index.xml' && !path.startsWith('/__sitemap__/'))
    return
  if (useRuntimeConfig(event).public.siteEnv !== 'production') {
    setHeader(event, 'Cache-Control', 'no-store')
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
})
