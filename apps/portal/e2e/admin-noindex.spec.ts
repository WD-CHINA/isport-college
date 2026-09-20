import { expect, test } from '@playwright/test'

/** 管理端 CSR + 禁止收录：响应头、Meta 与 robots.txt 三层防护 */
test('/admin 返回 noindex 响应头', async ({ request }) => {
  const response = await request.get('/admin')
  expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive')
})

test('/en/admin 返回 noindex 响应头', async ({ request }) => {
  const response = await request.get('/en/admin')
  expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive')
})

test('/admin SSR HTML 不含业务数据（CSR 占位）', async ({ request }) => {
  const response = await request.get('/admin')
  const html = await response.text()
  expect(html).not.toContain('最新开课')
})

test('非生产环境 robots.txt 禁止抓取全站', async ({ request }) => {
  const response = await request.get('/robots.txt')
  const body = await response.text()
  expect(body).toContain('Disallow: /')
})

test('非生产环境公开页面返回 noindex 响应头', async ({ request }) => {
  const response = await request.get('/', { headers: { 'Accept-Language': 'zh-CN' } })
  expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive')
})
