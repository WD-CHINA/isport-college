import { SITE_URL } from '../../app/utils/seo'

/** 正式环境开放公开页面；测试环境保持全站禁止抓取。 */
export default defineEventHandler(event => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')

  const config = useRuntimeConfig(event)
  if (config.public.siteEnv !== 'production') {
    return ['User-agent: *', 'Disallow: /', ''].join('\n')
  }

  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /en/admin',
    'Disallow: /en/admin/',
    'Disallow: /api/',
    'Disallow: /rsp/',
    'Disallow: /viewer/',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    '',
  ].join('\n')
})
