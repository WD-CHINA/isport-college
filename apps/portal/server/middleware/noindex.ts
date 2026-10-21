import { isSearchPage } from '../../app/utils/seo'

/** 测试环境禁止收录；公开站内搜索允许跟踪链接但不收录搜索结果。 */
export default defineEventHandler(event => {
  const config = useRuntimeConfig(event)
  if (config.public.siteEnv !== 'production') {
    setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  } else if (isSearchPage(event.path, getQuery(event))) {
    setHeader(event, 'X-Robots-Tag', 'noindex, follow')
  }
})
