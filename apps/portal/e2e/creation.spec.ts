import { expect, test, setSession, testSession, waitForHydration } from './academy.fixture'

test('访客可直接浏览创作中心，所有 P0 入口仅提示敬请期待', async ({ page }) => {
  const apiRequests: string[] = []
  page.on('request', request => {
    if (request.url().includes('/api/v1/')) apiRequests.push(request.url())
  })
  await page.goto('/creation')
  await waitForHydration(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('分享好课，让经验被看见、被采用')
  await expect(page.locator('.creation-works__row')).toHaveCount(4)
  await expect(page.locator('.creation-points__balance strong')).toHaveText('220')
  for (const name of [
    '上传我的创作',
    '查看全部',
    '积分明细',
    '积分兑换',
    '动作示范视频',
    '教学课件',
    '微课',
    '公开课预录',
    '教学实践案例',
  ]) {
    await page.getByRole('button', { name: new RegExp(name) }).click()
    await expect(page.locator('.ant-message-notice-info').last()).toContainText('敬请期待')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page).toHaveURL('/creation')
  }
  await page.locator('.creation-works__name').first().click()
  await expect(page.locator('.ant-message-notice-info').last()).toContainText('敬请期待')
  await page.locator('.creation-works__more').first().click()
  await page.getByRole('menuitem', { name: '查看作品', exact: true }).click()
  await expect(page.locator('.ant-message-notice-info').last()).toContainText('敬请期待')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('input[type="file"]')).toHaveCount(0)
  expect(apiRequests).toEqual([])
})

test('普通账号同样只浏览概览，不出现投稿表单或额外页面', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/creation')
  await waitForHydration(page)
  await page.getByRole('button', { name: '上传我的创作', exact: true }).click()
  await expect(page.locator('.ant-message-notice-info')).toContainText('敬请期待')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect((await context.request.get('/creation/upload')).status()).toBe(404)
})

test('创作中心中英文 SSR 正文与禁止收录响应头一致', async ({ request }) => {
  for (const path of ['/creation', '/en/creation', '/en/Creation/']) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(response.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive')
    const html = await response.text()
    expect(html).toContain(path.startsWith('/en') ? 'Create and share' : '创作内容')
    expect(html).toContain('noindex, nofollow, noarchive')
  }
})

test('移动端可从菜单进入创作中心，Toast 与内容不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/resources')
  await page.getByRole('button', { name: '菜单', exact: true }).click()
  await page.locator('.app-header__panel-creation').click()
  await expect(page).toHaveURL(/\/creation$/)
  await expect(page.getByRole('heading', { name: '创作内容', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByRole('button', { name: '上传我的创作' }).click()
  await expect(page.locator('.ant-message-notice-info')).toContainText('敬请期待')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('英文窄屏标题与语言菜单不重叠，菜单可回到学苑首页', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/en/creation')
    await waitForHydration(page)
    const title = await page.locator('.app-header__section').boundingBox()
    const language = await page.getByRole('button', { name: 'Language English' }).boundingBox()
    expect(title!.x + title!.width).toBeLessThanOrEqual(language!.x)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
  }
  await page.getByRole('button', { name: 'Menu', exact: true }).click()
  await page.locator('.app-header__panel').getByRole('link', { name: 'Home', exact: true }).click()
  await expect(page).toHaveURL(/\/en$/)
})
