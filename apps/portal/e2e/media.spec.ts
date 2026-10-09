import { expect, test } from './academy.fixture'

test.describe('媒体详情', () => {
  test.skip(true, '依赖已移除的同源 mock 内容种子，待按真实 /api/v1 内容重写')

  test('占位', async ({ page }) => {
    await page.goto('/resources/905')
    await expect(page.getByRole('heading').first()).toBeVisible()
  })
})
