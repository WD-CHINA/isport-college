import { createAcademyClient } from '../../../app/api/academy'
import { createRequest } from '../../../app/api/request'
import { createAcademyDataClient } from '../../../app/utils/academy-data'
import { PUBLIC_PAGE_PATHS } from '../../../app/utils/seo'
import { webContentPath, type WebPage } from '@isport/shared'

/** 遍历公开列表，不携带访客 Cookie 或登录凭证；下架内容由公开接口过滤。 */
async function allPages<T>(
  load: (query: Record<string, number>, signal: AbortSignal) => Promise<WebPage<T>>,
  signal: AbortSignal,
): Promise<T[]> {
  const items: T[] = []
  for (let pageNum = 1; pageNum <= 500; pageNum++) {
    const page = await load({ pageNum, pageSize: 50 }, signal)
    if (!page.list.length && items.length < page.total)
      throw new Error('Incomplete public content list')
    items.push(...page.list)
    if (items.length >= page.total) return items
  }
  throw new Error('Public content list exceeds sitemap pagination limit')
}

export default defineSitemapEventHandler(async event => {
  const config = useRuntimeConfig(event)
  if (config.public.siteEnv !== 'production') throw createError({ statusCode: 404 })
  const signal = AbortSignal.timeout(20000)
  const localized = await Promise.all(
    (['zh-CN', 'en-US'] as const).map(async locale => {
      const api = createAcademyDataClient(
        createAcademyClient(createRequest({ baseURL: config.apiBase, getLocale: () => locale })),
      )
      const [resources, research, schools, teachers, news] = await Promise.all([
        allPages(api.resources, signal),
        allPages(api.research, signal),
        allPages(api.schools, signal),
        allPages(api.teachers, signal),
        allPages(api.news, signal),
      ])
      const prefix = locale === 'en-US' ? '/en' : ''
      const paths = new Set<string>([
        ...PUBLIC_PAGE_PATHS,
        ...[...resources, ...research, ...schools].map(webContentPath).filter(Boolean),
        ...teachers.map(item => `/teachers/${item.id}`),
        ...news.filter(item => item.detailType === 'ARTICLE').map(item => `/news/${item.id}`),
      ])
      // 没有真实修改时间，不用构建时间或发布时间充当 lastmod。
      return [...paths].map(path => ({ loc: `${prefix}${path === '/' ? '' : path}` || '/' }))
    }),
  )
  return localized.flat()
})
