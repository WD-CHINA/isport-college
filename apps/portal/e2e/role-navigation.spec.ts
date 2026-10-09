import { expect, test } from './academy.fixture'

test.describe('角色导航', () => {
  test.skip(true, '前台接口不返回角色，管理端能力默认关闭')

  test('占位', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /融梦学苑|Academy/ }).first()).toBeVisible()
  })
})
