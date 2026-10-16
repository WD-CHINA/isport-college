import { expect, test } from './academy.fixture'

test.use({ viewport: { width: 390, height: 844 }, locale: 'zh-CN' })
for (const path of [
  '/',
  '/resources',
  '/preview/article/resources/1',
  '/en',
  '/en/resources',
  '/preview/resource/resources/4',
]) {
  test(`移动端 ${path} 无横向溢出`, async ({ page }) => {
    await page.goto(path)
    await expect(page.locator('h1').first()).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0)
  })
}
