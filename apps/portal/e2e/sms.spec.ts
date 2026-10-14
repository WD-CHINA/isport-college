import { expect, test, waitForHydration } from './academy.fixture'

test('短信成功信封省略 data 时启动倒计时且可以继续登录', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await page.locator('.app-header__login').click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#login-phone').fill('13800138000')
  const response = page.waitForResponse('**/api/v1/auth/sms')
  await dialog.getByRole('button', { name: '获取验证码', exact: true }).click()
  expect(await (await response).json()).toEqual({ status: 200, message: 'OK' })
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toBeDisabled()
  await expect(page.locator('.ant-message-notice-error')).toHaveCount(0)
  await expect(
    page.locator('.ant-message-notice-success').filter({ hasText: '验证码已发送' }),
  ).toBeVisible()
  await dialog.locator('#login-code').fill('123456')
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(dialog).toBeHidden()
  await expect(
    page.locator('.ant-message-notice-success').filter({ hasText: '登录成功' }),
  ).toBeVisible()
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
})

test('短信失败信封省略 data 时显示消息，不启动倒计时，重试成功可继续', async ({ page }) => {
  await page.route('**/api/v1/auth/sms', route =>
    route.fulfill({
      json: { status: 400, message: '发送频繁，请稍后重试' },
    }),
  )
  await page.goto('/resources')
  await waitForHydration(page)
  await page.locator('.app-header__login').click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#login-phone').fill('13800138000')
  const send = dialog.getByRole('button', { name: '获取验证码', exact: true })
  await send.click()
  await expect(page.locator('.ant-message-notice-error')).toContainText('发送频繁，请稍后重试')
  await expect(page.locator('.ant-message-notice-success')).toHaveCount(0)
  await expect(send).toBeEnabled()
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toHaveCount(0)
  await send.click()
  await expect(page.locator('.ant-message-notice-error')).toHaveCount(1)
  await expect(page.locator('.ant-message-notice-error')).toContainText('发送频繁，请稍后重试')
  await page.unroute('**/api/v1/auth/sms')
  await send.click()
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toBeDisabled()
  await expect(page.locator('.ant-message-notice-error')).toHaveCount(0)
})
