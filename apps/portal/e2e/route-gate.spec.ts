import { expect, test } from './academy.fixture'

test.describe('路由门禁', () => {
  test.skip(true, '依赖已移除的同源 mock 角色会话，待按真实登录态重写')

  test('未登录访问管理端被引导', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('button', { name: /登\s*录|Sign In/ }).first()).toBeVisible()
  })
})
