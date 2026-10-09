import { AUTH_COOKIE_NAME } from '@isport/shared'
import { expect, test, setSession, smsLogin, testSession } from './academy.fixture'

test('短信登录、会话恢复与退出', async ({ page, context }) => {
  await page.goto('/resources')
  await page.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await smsLogin(page)
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  expect(
    (await context.cookies()).find(cookie => cookie.name === AUTH_COOKIE_NAME)?.value,
  ).toContain('e2e-1-login')
  await page.reload()
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  await page.getByRole('button', { name: '退出登录', exact: true }).first().click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /确\s*定/ })
    .click()
  await expect(page.locator('.app-header__user')).toHaveCount(0)
  await expect
    .poll(async () => (await context.cookies()).some(cookie => cookie.name === AUTH_COOKIE_NAME))
    .toBe(false)
})
test('登录后恢复个人中心导航', async ({ page }) => {
  await page.goto('/resources')
  await page.locator('.app-header__nav').getByRole('link', { name: '我的账号' }).click()
  await expect(page).toHaveURL(/\/resources$/)
  await smsLogin(page)
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('heading', { name: '测试用户1' })).toBeVisible()
})
test('验证码错误可纠正，未同意协议不能登录', async ({ page }) => {
  await page.goto('/resources')
  await page.getByRole('button', { name: /登\s*录/, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#login-phone').fill('13800138000')
  await dialog.getByRole('button', { name: '获取验证码' }).click()
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toBeVisible()
  await dialog.locator('#login-code').fill('000000')
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('请先阅读并同意')
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('验证码错误')
  await dialog.locator('#login-code').fill('123456')
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(dialog).toBeHidden()
})
test('会话过期清 Cookie，公开正文继续显示', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(1, 'expired'), baseURL!)
  await page.goto('/resources/1')
  await expect(page.getByRole('heading', { name: '资源示例 1', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /登\s*录/, exact: true })).toBeVisible()
  await expect
    .poll(async () => (await context.cookies()).some(cookie => cookie.name === AUTH_COOKIE_NAME))
    .toBe(false)
})
test('登录后点赞回放与个人记录移除', async ({ page }) => {
  await page.goto('/resources/1')
  await page.getByRole('button', { name: /^点赞/ }).click()
  await smsLogin(page)
  await expect(page.getByRole('button', { name: /^取消点赞/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.locator('.app-header__nav').getByRole('link', { name: '我的账号' }).click()
  await expect(page).toHaveURL(/\/account$/)
  await page.getByRole('button', { name: /^我的点赞/ }).click()
  await expect(page.locator('.activity-list')).toContainText('资源示例 1')
  await page.locator('.activity-list').getByRole('button').click()
  await expect(page.locator('.activity-list')).toHaveCount(0)
  await expect(page.locator('.activity-list__empty')).toBeVisible()
})
