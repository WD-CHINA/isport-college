import {
  expect,
  test,
  navigateToLocale,
  returnFromBackground,
  waitForHydration,
} from './academy.fixture'

for (const [path, englishPath, endpoint] of [
  ['/', '/en', '/api/v1/home'],
  ['/resources?category=1', '/en/resources?category=1', '/api/v1/resources'],
  ['/preview/article/research/1', '/en/preview/article/research/1', '/api/v1/research/1'],
] as const) {
  test(`${path} 无语言操作入口，语言路由与后台恢复请求对应语言`, async ({ page }) => {
    await page.goto(path)
    await waitForHydration(page)
    const locales: string[] = []
    page.on('request', request => {
      if (new URL(request.url()).pathname === endpoint) {
        locales.push(request.headers()['x-locale'] ?? '')
      }
    })

    await expect(page.locator('.app-locale-menu')).toHaveCount(0)
    await expect(page.getByRole('button', { name: /^语言 / })).toHaveCount(0)

    // 普通窗口聚焦与悬停导航均不应刷新当前内容。
    await page.evaluate(() => window.dispatchEvent(new Event('focus')))
    await page.locator('.app-header__brand').hover()
    await expect(page).toHaveURL(path)
    await page.waitForTimeout(200)
    expect(locales).toEqual([])

    await navigateToLocale(page, 'en')
    await expect(page).toHaveURL(englishPath)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
    await expect.poll(() => locales).toEqual(['en-US'])

    // 无隐藏过程的可见事件不刷新；真正从后台恢复时仍能刷新当前语言。
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await page.waitForTimeout(200)
    expect(locales).toEqual(['en-US'])
    await returnFromBackground(page)
    await expect.poll(() => locales).toEqual(['en-US', 'en-US'])
  })
}
