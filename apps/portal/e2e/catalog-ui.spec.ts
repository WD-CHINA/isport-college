import { expect, test, waitForHydration } from './academy.fixture'

test('教研首屏默认教学实践，四个文字分类与真实查询同步', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/v1/research') requests.push(request.url())
  })
  const response = await page.goto('/research')
  expect(await response!.text()).toContain('aria-pressed="true"')
  await waitForHydration(page)
  await expect(page).toHaveURL(/\/research\?category=SERIES$/)
  const tabs = page.locator('.catalog-category-tabs')
  await expect(tabs.getByRole('button')).toHaveCount(4)
  await expect(tabs.getByRole('button', { name: '教学实践', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(requests).toHaveLength(0)
  const changed = page.waitForRequest(request => {
    const url = new URL(request.url())
    return (
      url.pathname === '/api/v1/research' && url.searchParams.get('categoryCode') === 'RESEARCH'
    )
  })
  await tabs.getByRole('button', { name: '教研与专业发展', exact: true }).click()
  await changed
  await expect(page).toHaveURL(/category=RESEARCH/)
  await expect(page.locator('.content-list-feature__heading h2')).toHaveText('教研与专业发展')
  await page.reload()
  await expect(tabs.getByRole('button', { name: '教研与专业发展', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('学校案例使用三个文字分类，分类切换与查看案例保留真实路由', async ({ page }) => {
  await page.goto('/schools')
  await waitForHydration(page)
  const tabs = page.locator('.catalog-category-tabs')
  await expect(tabs.getByRole('button')).toHaveCount(3)
  await expect(tabs.getByRole('button', { name: '全部案例', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await tabs.getByRole('button', { name: '校本课程建设', exact: true }).click()
  await expect(page).toHaveURL(/category=CURRICULUM/)
  await expect(page.locator('.content-list-feature__heading h2')).toHaveText('校本课程建设')
  await page.locator('.content-card__link').first().click()
  await expect(page).toHaveURL('/preview/article/schools/1')
  await expect(
    page.getByRole('heading', { level: 1, name: '资源示例 1', exact: true }),
  ).toBeVisible()
})

test('资源主视觉搜索保留筛选，二级分类与重置同步地址', async ({ page }) => {
  await page.goto('/resources?category=1&recommendedLevel=3')
  await waitForHydration(page)
  await page.locator('.catalog-hero').getByRole('searchbox').fill('资源')
  await page.locator('.catalog-hero').getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page).toHaveURL(/keyword=/)
  await expect(page).toHaveURL(/recommendedLevel=3/)
  await page
    .getByRole('group', { name: '二级分类', exact: true })
    .getByRole('button', { name: '力量', exact: true })
    .click()
  await expect(page).toHaveURL(/secondCategoryId=10/)
  await page.getByRole('button', { name: '重置筛选', exact: true }).click()
  await expect(page).toHaveURL(/\/resources\?category=1$/)
  await expect(page.locator('.catalog-hero').getByRole('searchbox')).toHaveValue('')
})

for (const [channel, category] of [
  ['research', 'RESEARCH'],
  ['schools', 'CURRICULUM'],
] as const) {
  test(`${channel} 移除搜索入口，分类切换与刷新仍保留结果`, async ({ page }) => {
    await page.goto(`/${channel}`)
    await waitForHydration(page)
    await expect(page.locator('.content-filters__search-toggle')).toHaveCount(0)
    await expect(page.locator('.content-filters').getByRole('textbox')).toHaveCount(0)
    const categoryButton = page.locator('.catalog-category-tabs').getByRole('button').nth(1)
    await categoryButton.click()
    await expect(page).toHaveURL(new RegExp(`category=${category}`))
    await page.reload()
    await expect(categoryButton).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.content-card').first()).toContainText('资源示例 1')
  })
}

for (const width of [320, 390]) {
  for (const locale of ['zh', 'en']) {
    test(`栏目与登录弹窗在 ${width}px ${locale} 下完整可用`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      const prefix = locale === 'en' ? '/en' : ''
      for (const channel of ['resources', 'research', 'schools']) {
        await page.goto(`${prefix}/${channel}`)
        await waitForHydration(page)
        await expect(page.locator('.catalog-hero h1')).toBeVisible()
        await expect(page.locator('.content-filters__search-toggle')).toHaveCount(0)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        await expect(page.locator('.app-footer__inner')).toBeVisible()
      }
      await page.locator('.app-header__burger').click()
      await page
        .locator('.app-header__panel')
        .getByRole('button', { name: locale === 'en' ? 'Sign in' : /登\s*录/, exact: true })
        .click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.locator('#login-phone')).toBeVisible()
      await expect(dialog.locator('#login-code')).toBeVisible()
      await expect(dialog.getByRole('checkbox')).toBeVisible()
      const bounds = await dialog.boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
    })
  }
}
