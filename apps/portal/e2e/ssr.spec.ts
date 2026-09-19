import { expect, test } from '@playwright/test'

/** C 端 SSR：首屏 HTML 应直接包含渲染内容，无需等待 JS */
test('首页 SSR 直出课程内容', async ({ request }) => {
  // Accept-Language 不参与语言判定：SSR 首屏恒为默认中文
  const response = await request.get('/', { headers: { 'Accept-Language': 'zh-CN' } })
  expect(response.ok()).toBeTruthy()
  const html = await response.text()
  expect(html).toContain('lang="zh-CN"')
  expect(html).toContain('精选课程')
})

test('课程列表页 SSR 直出', async ({ page }) => {
  const response = await page.goto('/courses')
  const html = await response!.text()
  expect(html).toContain('课程中心')
})

test('英文路由带 /en 前缀且 html[lang] 正确', async ({ page }) => {
  const response = await page.goto('/en/courses')
  const html = await response!.text()
  expect(html).toContain('lang="en-US"')
  expect(html).toContain('Courses')
})

test('英文浏览器访问根路径不做语言重定向', async ({ request }) => {
  // detectBrowserLanguage 已关闭：语言偏好由 localStorage 恢复，SSR 恒为默认中文
  const response = await request.get('/', {
    headers: { 'Accept-Language': 'en-US' },
    maxRedirects: 0,
  })
  expect(response.status()).toBe(200)
  expect(response.headers()['location']).toBeUndefined()
  const html = await response.text()
  expect(html).toContain('lang="zh-CN"')
  expect(html).toContain('精选课程')
})
