import { expect, test } from '@playwright/test'

/** 演示账号登录：全局唯一登录弹窗 → 登录成功 → 恢复目标操作 */
test('未登录访问 /admin 弹出登录框，登录后进入工作台', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByPlaceholder('请输入手机号').fill('188 8888 8888')
  await page.getByPlaceholder('请输入密码').fill('123456')
  await page.getByRole('button', { name: '登 录' }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByText('课程总数')).toBeVisible()
})
