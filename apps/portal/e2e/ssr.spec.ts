import { expect, test, type Page } from '@playwright/test'
import { setSession, switchLanguage, testSession, waitForHydration } from './academy.fixture'

function collectHydrationErrors(page: Page) {
  const errors: string[] = []
  page.on('console', message => {
    if (/hydration.*mismatch/i.test(message.text())) errors.push(message.text())
  })
  return errors
}

test('SSR 加载失败在水合后显示 hook 消息，保留重试入口', async ({ page }) => {
  const hydrationErrors = collectHydrationErrors(page)
  const response = await page.goto('/preview/article/resources/997')
  expect(await response!.text()).not.toContain('ant-alert')
  await waitForHydration(page)
  await expect(page.locator('.ant-message-notice-error')).toContainText('请求失败，请重试')
  await expect(page.getByRole('button', { name: /重\s*试/, exact: true })).toBeVisible()
  await page.route('**/api/v1/resources/997', async route => {
    const result = await route.fetch({ url: route.request().url().replace('/997', '/1') })
    await route.fulfill({ response: result })
  })
  await page.getByRole('button', { name: /重\s*试/, exact: true }).click()
  await expect(
    page.getByRole('heading', { level: 1, name: '资源示例 1', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.ant-message-notice-error')).toHaveCount(0)
  expect(hydrationErrors).toEqual([])
})

for (const cached of [false, true]) {
  test(`首页布局延迟加载时，${cached ? '恢复资料缓存' : '快速 /me 响应'}不会抢先改变水合内容`, async ({
    page,
    context,
    baseURL,
  }) => {
    const session = testSession()
    await setSession(context, session, baseURL!)
    if (cached) {
      await page.addInitScript(value => localStorage.setItem('ic_auth', JSON.stringify(value)), {
        ...session,
        profile: { ...session.profile, nickname: '缓存用户', avatarCode: 4 },
      })
    }
    const hydrationErrors = collectHydrationErrors(page)
    let delayedLayout = false
    await page.route('**/_nuxt/*.js', async route => {
      const response = await route.fetch()
      // 首屏布局是异步模块；模拟网络较慢，让根应用先触发 mounted。
      if ((await response.text()).includes('app-header__user')) {
        delayedLayout = true
        await new Promise(resolve => setTimeout(resolve, 700))
      }
      await route.fulfill({ response })
    })
    const response = await page.goto('/')
    const html = await response!.text()
    expect(html).toContain('我的账号')
    expect(html).not.toContain(session.token)
    await waitForHydration(page)
    await expect(page.locator('.app-header__user')).toContainText('测试用户1')
    expect(delayedLayout).toBe(true)
    expect(hydrationErrors).toEqual([])
    await page.unrouteAll({ behavior: 'wait' })
  })
}

/** C 端 SSR：首屏 HTML 应直接包含渲染内容，无需等待 JS */
test('首页 SSR 直出课程内容', async ({ request }) => {
  // 明确使用中文，避免根路径的浏览器语言检测触发重定向。
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

test('入站 Host 与转发地址不会改变 SSR 的固定上游', async ({ request }) => {
  const response = await request.get('/preview/article/resources/1', {
    headers: {
      Host: '127.0.0.1:1',
      'X-Forwarded-Host': 'untrusted.example',
      'X-Forwarded-Proto': 'https',
    },
  })
  expect(response.status()).toBe(200)
  expect(await response.text()).toContain('这是可独立加载的教学正文。')
})

for (const [prefix, language, emptyTitle] of [
  ['', 'zh-CN', '暂无数据'],
  ['/en', 'en-US', 'No data'],
] as const) {
  for (const path of ['/resources?keyword=no-match', '/teachers?page=2', '/news?page=2']) {
    test(`${language} ${path} 空状态的 SSR 与水合文案一致`, async ({ page }) => {
      const hydrationErrors = collectHydrationErrors(page)
      const response = await page.goto(`${prefix}${path}`)
      expect(await response!.text()).toContain(`<title>${emptyTitle}</title>`)
      await expect(page.locator('.ant-empty svg title')).toHaveText(emptyTitle)
      await expect(page.locator('html')).toHaveAttribute('lang', language)
      await expect(
        page.getByRole('button', {
          name: prefix ? 'Language English' : '语言 简体中文',
          exact: true,
        }),
      ).toBeVisible()
      expect(hydrationErrors).toEqual([])
    })
  }
}

test('空状态切换语言及刷新后保持一致', async ({ page }) => {
  const hydrationErrors = collectHydrationErrors(page)
  await page.goto('/resources?keyword=no-match')
  await expect(page.locator('.ant-empty svg title')).toHaveText('暂无数据')
  await switchLanguage(page, 'en')
  await expect(page).toHaveURL('/en/resources?category=1&keyword=no-match')
  await expect(page.locator('.ant-empty svg title')).toHaveText('No data')
  await expect(page.locator('h1')).toHaveText('PE Teaching Resource Library')
  await page.reload()
  await expect(page.locator('.ant-empty svg title')).toHaveText('No data')
  await switchLanguage(page, 'zh')
  await expect(page).toHaveURL('/resources?category=1&keyword=no-match')
  await expect(page.locator('.ant-empty svg title')).toHaveText('暂无数据')
  await expect(page.locator('h1')).toHaveText('体育教学资源库')
  expect(hydrationErrors).toEqual([])
})

test('首页多个空分区在语言切换后分别保留插图', async ({ page }) => {
  const hydrationErrors = collectHydrationErrors(page)
  await page.goto('/')
  const titles = page.locator('.ant-empty svg title')
  await expect(titles).toHaveText(['暂无数据', '暂无数据'])
  await switchLanguage(page, 'en')
  await expect(page).toHaveURL('/en')
  await expect(titles).toHaveText(['No data', 'No data'])
  await page.reload()
  await expect(titles).toHaveText(['No data', 'No data'])
  await switchLanguage(page, 'zh')
  await expect(page).toHaveURL('/')
  await expect(titles).toHaveText(['暂无数据', '暂无数据'])
  expect(hydrationErrors).toEqual([])
})
