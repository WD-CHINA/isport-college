import { expect, test, waitForHydration } from './academy.fixture'

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
  await page.locator('.app-header__panel').getByRole('link', { name: 'Teachers' }).click()
  await expect(page).toHaveURL(/\/en\/teachers$/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
