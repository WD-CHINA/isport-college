/** 搜索引擎抓取规则：管理端全路径禁止抓取 */
export default defineEventHandler(event => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/',
    'Disallow: /en/admin',
    'Disallow: /en/admin/',
    '',
  ].join('\n')
})
