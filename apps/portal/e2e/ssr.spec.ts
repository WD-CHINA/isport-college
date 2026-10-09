import { expect, test } from '@playwright/test'

/** C 端 SSR：首屏 HTML 应直接包含渲染内容，无需等待 JS */
test('首页 SSR 直出课程内容', async ({ request }) => {
  // Accept-Language 不参与语言判定：SSR 首屏恒为默认中文
  const response = await request.get('/', { headers: { 'Accept-Language': 'zh-CN' } })
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain('lang="zh-CN"')
  expect(html).toContain('学苑精选')
})

test('课程列表页 SSR 直出', async ({ page }) => {
  const response = await page.goto('/courses')
  const html = await response!.text()
  expect(html).toContain('教学资源')
})

test('英文路由带 /en 前缀且 html[lang] 正确', async ({ page }) => {
  const response = await page.goto('/en/courses')
  const html = await response!.text()
  expect(html).toContain('lang="en-US"')
  expect(html).toContain('Teaching Resources')
})

test('英文浏览器首次访问根路径时由服务端重定向并写入语言 Cookie', async ({ request }) => {
  const response = await request.get('/', {
    headers: { 'Accept-Language': 'en-US' },
    maxRedirects: 0,
  })
  expect(response.status()).toBe(302)
  expect(response.headers()['location']).toBe('/en')
  expect(response.headers()['set-cookie']).toContain('ic_locale=en')
})

test('公开 SSR 不等待慢 /me，令牌不进入页面 payload', async ({ context, baseURL }) => {
  const { setSession, testSession } = await import('./academy.fixture')
  const session = testSession(1, 'slow-me')
  await setSession(context, session, baseURL!)
  const started = Date.now()
  const response = await context.request.get('/resources')
  expect(response.status()).toBe(200)
  expect(Date.now() - started).toBeLessThan(2500)
  const html = await response.text()
  expect(html).toContain('资源示例 1')
  expect(html).not.toContain(session.token)
})

test('SSR 的英文语言头到达外部 API', async ({ request }) => {
  const response = await request.get('/en/resources')
  const html = await response.text()
  expect(response.status()).toBe(200)
  expect(html).toContain('Resource 1')
  expect(html).not.toContain('资源示例 1')
})
