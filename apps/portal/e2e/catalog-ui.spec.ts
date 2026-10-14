import { expect, test, waitForHydration } from './academy.fixture'

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

test('教研搜索可展开，分类与刷新保留真实结果', async ({ page }) => {
  await page.goto('/research')
  await waitForHydration(page)
  await page.locator('.content-filters__search-toggle summary').click()
  await page.getByRole('textbox', { name: '搜索内容名称', exact: true }).fill('资源')
  await page
    .locator('.content-filters__search')
    .getByRole('button', { name: /搜\s*索/, exact: true })
    .click()
  await expect(page).toHaveURL(/keyword=/)
  await page.getByRole('button', { name: '教学实践', exact: true }).click()
  await expect(page).toHaveURL(/category=SERIES/)
  await page.reload()
  await expect(page.getByRole('button', { name: '教学实践', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.locator('.content-card').first()).toContainText('资源示例 1')
})

for (const width of [320, 390]) {
  for (const locale of ['zh', 'en']) {
    test(`栏目与登录弹窗在 ${width}px ${locale} 下完整可用`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      const prefix = locale === 'en' ? '/en' : ''
      for (const channel of ['resources', 'research', 'schools']) {
        await page.goto(`${prefix}/${channel}`)
        await waitForHydration(page)
        await expect(page.locator('.catalog-hero h1')).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        await expect(page.locator('.app-footer__inner')).toHaveCount(0)
      }
      await page
        .locator('.app-header__actions')
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
