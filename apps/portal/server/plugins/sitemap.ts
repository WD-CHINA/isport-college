/** 数据源失败时返回服务错误，避免搜索引擎收到并缓存空站点地图。 */
export default defineNitroPlugin(nitro => {
  nitro.hooks.hook('sitemap:resolved', context => {
    if (!context.urls.length)
      throw createError({ statusCode: 503, statusMessage: 'Sitemap source unavailable' })
  })
})
