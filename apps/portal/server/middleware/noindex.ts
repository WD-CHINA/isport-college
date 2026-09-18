/** 非生产环境全站禁止搜索引擎收录；生产环境仅由管理端 Route Rules 禁止收录。 */
export default defineEventHandler(event => {
  const config = useRuntimeConfig(event)
  if (config.public.siteEnv !== 'production') {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  }
})
