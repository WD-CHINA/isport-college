import { test, expect } from './academy.fixture'

test('首页和三类栏目 SSR、英文、旧地址与分页种子', async ({ context }) => {
  for (const [path, title] of [
    ['/', '学苑精选'],
    ['/resources?category=fitness', '体能'],
    ['/research', '教研学习'],
    ['/schools', '学校案例'],
    ['/en/resources?category=fitness', 'Fitness'],
  ]) {
    const response = await context.request.get(path!)
    expect(response.status()).toBe(200)
    const html = await response.text()
    expect(html).toContain(title)
    expect(html).toContain('data-content-id')
    expect(html).not.toContain('立即报名')
  }
  const redirect = await context.request.get('/en/courses?level=3', { maxRedirects: 0 })
  expect(redirect.status()).toBe(301)
  expect(redirect.headers().location).toContain('/en/resources?level=3')
  expect((await context.request.get('/courses/not-a-seed')).status()).toBe(404)
})

test('资源组合筛选、分页、回退恢复和清理失效条件', async ({ page }) => {
  await page.goto('/resources?category=fitness')
  await expect(page.locator('.content-card')).toHaveCount(12)
  const firstTitle = await page.locator('.content-card h3').first().textContent()
  await page.locator('.ant-pagination-item-2').click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('.content-card')).toHaveCount(6)
  await page.goBack()
  await expect(page.locator('.content-card')).toHaveCount(12)
  await expect(page.locator('.content-card h3').first()).toHaveText(firstTitle!)
  await page.goto('/resources?category=fitness&fitness=strength&bodyPart=whole&page=2')
  await page.getByRole('button', { name: '专项技能', exact: true }).click()
  await expect(page).toHaveURL(/category=sport$/)
  await expect(page.getByRole('combobox', { name: '身体部位' })).toHaveCount(0)
  await page.getByRole('textbox', { name: '搜索内容名称' }).fill('不存在的资源名称')
  await page.getByRole('button', { name: /^搜\s*索$/ }).click()
  await expect(page.getByText('没有找到符合条件的内容，试试调整筛选条件。')).toBeVisible()
  await page.getByRole('button', { name: /^重\s*置$/ }).click()
  await expect(page).toHaveURL(/category=sport$/)
  await expect(page.locator('.content-card')).toHaveCount(12)
})

test('无效 URL 归一化、错误重试与外链不生成本站详情', async ({ page, context }) => {
  await page.goto('/resources?category=bad&page=-1&level=99&fitness=bad')
  await expect(page).toHaveURL(/resources\?category=fitness$/)
  const control = await context.request.post('/api/academy/mock/control', {
    headers: { 'x-mock-control-key': process.env.ACADEMY_TEST_CONTROL_KEY! },
    data: { action: 'fault', operation: 'content/list', kind: 'error', status: 500 },
  })
  expect(control.ok()).toBe(true)
  await page.goto('/research')
  await expect(page.getByText('请求失败，请重试')).toBeVisible()
  await page.getByRole('button', { name: /^重\s*试$/ }).click()
  await expect(page.locator('.content-card')).toHaveCount(12)
  const external = page.locator('.content-card a[target="_blank"]').first()
  await expect(external).toHaveAttribute('href', 'https://example.org/')
  await expect(external).toHaveAttribute('rel', /noopener/)
})

test('手机导航和英文列表无横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en/resources?category=fitness')
  await expect(page.getByRole('heading', { name: 'Teaching Resources', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.locator('.app-header__panel').getByRole('link', { name: 'School Stories' }).click()
  await expect(page).toHaveURL(/\/en\/schools$/)
  await expect(page.locator('.content-card')).toHaveCount(12)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
})
