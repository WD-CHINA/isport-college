import { expect, test, waitForHydration } from './academy.fixture'

for (const prefix of ['', '/en']) {
  test(`动态列表与详情使用独立数据缓存 ${prefix || '/zh'}`, async ({ page }) => {
    await page.goto(`${prefix}/news`)
    await waitForHydration(page)
    const item = page.locator('main a').filter({ hasText: '行业动态示例' })
    await expect(item).toBeVisible()
    await item.click()
    await expect(page).toHaveURL(new RegExp(`${prefix}/news/1$`))
    await expect(page.getByRole('heading', { name: '行业动态示例', exact: true })).toBeVisible()
    await expect(page.locator('.article-detail__body')).toContainText('动态正文')
    await page.goBack()
    await expect(item).toBeVisible()
  })
}
