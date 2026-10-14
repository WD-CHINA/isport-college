import { expect, test, waitForHydration } from './academy.fixture'

test('从首页进入资源列表，补齐默认分类只请求一次，切换分类正常刷新', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/v1/resources') requests.push(request.url())
  })
  await page.goto('/')
  await waitForHydration(page)
  await page
    .locator('.app-header__nav')
    .getByRole('link', { name: '教学资源', exact: true })
    .click()
  await expect(page).toHaveURL(/\/resources\?category=1$/)
  await expect(page.locator('.content-card')).toHaveCount(12)
  expect(requests).toHaveLength(1)
  expect(new URL(requests[0]!).searchParams.get('firstCategoryId')).toBe('1')
  const changed = page.waitForResponse(response => {
    const url = new URL(response.url())
    return url.pathname === '/api/v1/resources' && url.searchParams.get('firstCategoryId') === '2'
  })
  await page.getByRole('button', { name: '专项运动', exact: true }).click()
  await changed
  await expect(page).toHaveURL(/category=2/)
  await expect(page.locator('.content-card')).toHaveCount(12)
  expect(requests).toHaveLength(2)
  expect(new URL(requests[1]!).searchParams.get('firstCategoryId')).toBe('2')
})

test('直接打开资源列表复用 SSR 数据，URL 补齐分类不会重复请求', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/v1/resources') requests.push(request.url())
  })
  await page.goto('/resources')
  await waitForHydration(page)
  await expect(page).toHaveURL(/\/resources\?category=1$/)
  await expect(page.locator('.content-card')).toHaveCount(12)
  expect(requests).toHaveLength(0)
})

test('首页和栏目 SSR 打到独立学苑协议服务器', async ({ context }) => {
  for (const [path, marker] of [
    ['/', '资源示例 1'],
    ['/resources', '体能'],
    ['/research', '教研学习'],
    ['/schools', '学校案例'],
    ['/teachers', '名师风采'],
    ['/news', '行业动态'],
  ]) {
    const response = await context.request.get(path!)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain(marker)
    expect(html).not.toContain('立即报名')
  }
})

test('资源分类筛选更新查询参数', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await expect(page.getByRole('status')).toContainText(/共\s*\d+\s*条内容/)
  await page.getByRole('button', { name: /体\s*能/, exact: true }).click()
  await expect(page).toHaveURL(/category=1/)
  await expect(page.getByRole('status')).toContainText(/共\s*\d+\s*条内容/)
})

test('手机导航无横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/resources')
  await expect(
    page.getByRole('heading', { name: 'PE Teaching Resource Library', exact: true }),
  ).toBeVisible()
  await waitForHydration(page)
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.locator('.app-header__panel').getByRole('link', { name: 'School Stories' }).click()
  await expect(page).toHaveURL(/\/en\/schools$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
