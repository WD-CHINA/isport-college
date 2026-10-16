import { expect, test, setSession, testSession, waitForHydration } from './academy.fixture'

test('访客可从门户进入创作中心，作品、积分和投稿类型交互无需登录', async ({ page }) => {
  await page.goto('/resources')
  await page.locator('.app-header__cta-creation').click()
  await expect(page).toHaveURL(/\/creation$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('分享好课，让经验被看见、被采用')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByRole('tab', { name: '已发布（13）' })).toBeVisible()
  await expect(page.locator('.creation-works__row')).toHaveCount(4)
  await page.getByRole('tab', { name: '审核中（1）' }).click()
  await expect(page.locator('.creation-works__row')).toHaveCount(1)
  await page.getByRole('tab', { name: '草稿箱（0）' }).click()
  await expect(page.getByText('暂无草稿')).toBeVisible()

  await page.getByRole('button', { name: '查看全部' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('tab', { name: '已发布（13）' })).toBeVisible()
  await expect(dialog.locator('.creation-works__row')).toHaveCount(4)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: '积分明细' }).click()
  await expect(dialog.getByText('220', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: '上传我的创作' }).click()
  await expect(dialog.getByRole('button', { name: /动作示范视频/ })).toBeVisible()
  await dialog.getByRole('button', { name: /教学课件/ }).click()
  await expect(dialog.getByText('50 积分', { exact: true })).toBeVisible()
  await expect(dialog.locator('input[type="file"]')).toHaveCount(0)
  await dialog.getByRole('button', { name: '切换类型' }).click()
  await expect(dialog.getByRole('button', { name: /教学实践案例/ })).toBeVisible()
})

test('五类创作内容均可直接选择，普通账号也可访问概览', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/creation')
  for (const name of ['动作示范视频', '教学课件', '微课', '公开课预录', '教学实践案例']) {
    await page
      .locator('.creation-feature__body')
      .getByRole('button', { name: new RegExp(name) })
      .click()
    await expect(page.getByRole('dialog').getByText(name, { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toBeHidden()
  }
})

test('Demo 按原稿展示作品与积分，所有交互不请求业务接口', async ({ page }) => {
  const apiRequests: string[] = []
  page.on('request', request => {
    if (request.url().includes('/api/v1/')) apiRequests.push(request.url())
  })
  await page.goto('/creation')
  await waitForHydration(page)
  await expect(page.locator('.creation-points__balance strong')).toHaveText('220')
  await expect(page.locator('.creation-points__summary dd')).toHaveText(['25', '80'])
  await expect(page.locator('.creation-content__reward')).toHaveText([
    '50 积分',
    '50 积分',
    '100 积分',
    '100 积分',
    '50 积分',
  ])
  await expect(page.locator('.creation-works__name')).toHaveText([
    '篮球初级运球训练课（小学）',
    '中考1000米一周训练安排',
    '俯身哑铃划船（背部肌肉锻炼）',
    '中学篮球的两种典型排课模式',
  ])
  await expect(page.locator('main')).not.toContainText('未接入')
  await page.locator('.creation-works__more').first().click()
  await page.getByRole('menuitem', { name: '查看作品' }).click()
  await expect(page.getByRole('dialog')).toContainText('篮球初级运球训练课（小学）')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: '积分兑换', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('220')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(page.locator('.creation-points__balance strong')).toHaveText('220')
  expect(apiRequests).toEqual([])
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

test('移动端可从菜单进入创作中心，弹窗与内容不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/resources')
  await page.getByRole('button', { name: '菜单', exact: true }).click()
  await page.locator('.app-header__panel-creation').click()
  await expect(page).toHaveURL(/\/creation$/)
  await expect(page.getByRole('heading', { name: '创作内容', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByRole('button', { name: '上传我的创作' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '上传我的创作' })).toBeFocused()
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
