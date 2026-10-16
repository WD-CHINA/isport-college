import { AUTH_COOKIE_NAME } from '@isport/shared'
import {
  expect,
  test,
  setSession,
  smsLogin,
  switchLanguage,
  testSession,
  waitForHydration,
} from './academy.fixture'

test('刷新个人中心不再在浏览器重复请求 /me', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  const meRequests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname.endsWith('/api/v1/me')) meRequests.push(request.url())
  })
  await page.goto('/account')
  await waitForHydration(page)
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  await page.waitForTimeout(500)
  expect(meRequests).toEqual([])
})

test('资料校验失败和保存成功使用 hook 消息', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/account')
  await waitForHydration(page)
  await page.getByRole('button', { name: /编\s*辑/, exact: true }).click()
  const form = page.locator('.profile-form')
  await form.getByRole('textbox').fill('!')
  await form.getByRole('button', { name: /确\s*定/, exact: true }).click()
  await expect(page.locator('.ant-message-notice-error')).toBeVisible()
  await expect(form).toBeVisible()
  await form.getByRole('textbox').fill('新昵称')
  await form.getByRole('button', { name: /确\s*定/, exact: true }).click()
  await expect(page.locator('.ant-message-notice-success')).toContainText('资料已保存')
  await expect(page.getByRole('heading', { name: '新昵称', exact: true })).toBeVisible()
  await expect(form).toHaveCount(0)
})

test('短信登录、会话恢复与退出', async ({ page, context }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await page.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await smsLogin(page)
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  const authCookie = (await context.cookies()).find(cookie => cookie.name === AUTH_COOKIE_NAME)
  expect(decodeURIComponent(authCookie?.value ?? '')).toMatch(/^e2e-1-login-/)
  expect(authCookie?.value).not.toContain('profile')
  await page.reload()
  await waitForHydration(page)
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  await page.locator('.app-header__user').click()
  await page.getByRole('button', { name: '退出登录', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /确\s*定/ })
    .click()
  await expect(page.locator('.app-header__user')).toHaveCount(0)
  await expect(
    page.locator('.ant-message-notice-success').filter({ hasText: '已退出登录' }),
  ).toBeVisible()
  await expect
    .poll(async () => (await context.cookies()).some(cookie => cookie.name === AUTH_COOKIE_NAME))
    .toBe(false)
})
test('登录后恢复个人中心导航', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await page.goto('/account')
  await expect(page).toHaveURL(/\/$/)
  await smsLogin(page)
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('heading', { name: '测试用户1' })).toBeVisible()
})
test('验证码错误可纠正，未同意协议不能登录', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await page.getByRole('button', { name: /登\s*录/, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#login-phone').fill('13800138000')
  await dialog.getByRole('button', { name: '获取验证码' }).click()
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toBeVisible()
  await dialog.locator('#login-code').fill('000000')
  const submit = dialog.getByRole('button', { name: /登\s*录/, exact: true })
  await expect(submit).toBeDisabled()
  await dialog.getByRole('checkbox').check()
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(page.locator('.ant-message-notice-error')).toContainText('验证码错误')
  await dialog.locator('#login-code').fill('123456')
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(dialog).toBeHidden()
})
test('会话过期清 Cookie，公开正文继续显示', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(1, 'expired'), baseURL!)
  await page.goto('/preview/article/resources/1')
  await expect(
    page.getByRole('heading', { level: 1, name: '资源示例 1', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: /登\s*录/, exact: true })).toBeVisible()
  await expect
    .poll(async () => (await context.cookies()).some(cookie => cookie.name === AUTH_COOKIE_NAME))
    .toBe(false)
})
test('登录后点赞回放与个人记录移除', async ({ page }) => {
  await page.goto('/preview/article/resources/1')
  await waitForHydration(page)
  await page.getByRole('button', { name: /^点赞/ }).click()
  await smsLogin(page)
  await expect(page.getByRole('button', { name: /^取消点赞/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(
    page.locator('.ant-message-notice-success').filter({ hasText: '点赞成功' }),
  ).toBeVisible()
  await page.goto('/account')
  await page.getByRole('tab', { name: /^我的点赞/ }).click()
  await expect(page.locator('.activity-list')).toContainText('资源示例 1')
  await page.locator('.activity-list').getByRole('button').click()
  await expect(
    page.locator('.ant-message-notice-success').filter({ hasText: '已取消点赞' }),
  ).toBeVisible()
  await expect(page.locator('.activity-list')).toHaveCount(0)
  await expect(page.locator('.activity-list__empty')).toBeVisible()
})

test('英文点赞、取消点赞、收藏和取消收藏显示对应成功消息', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/en/preview/article/resources/1')
  await waitForHydration(page)
  const bar = page.locator('.interaction-bar')
  for (const [name, feedback] of [
    [/^Like/, 'Liked'],
    [/^Unlike/, 'Like removed'],
    [/^Save/, 'Saved'],
    [/^Unsave/, 'Removed from saved items'],
  ] as const) {
    await bar.getByRole('button', { name }).click()
    await expect(
      page.locator('.ant-message-notice-success').filter({ hasText: feedback }),
    ).toBeVisible()
  }
})

test('退出接口失败仅提示本地退出警告', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.route('**/api/v1/auth/logout', route =>
    route.fulfill({
      status: 503,
      json: { status: 503, message: 'Service unavailable', data: null },
    }),
  )
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  await page.locator('.app-header__user').click()
  await page.getByRole('button', { name: '退出登录', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /确\s*定/ })
    .click()
  await expect(page.locator('.ant-message-notice-warning')).toContainText('本地会话已清除')
  await expect(page.locator('.ant-message-notice-success')).toHaveCount(0)
})

test('个人收藏随语言切换重新加载，刷新后保持英文', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/preview/article/resources/1')
  await waitForHydration(page)
  await page.getByRole('button', { name: /^收藏/ }).click()
  await expect(page.getByRole('button', { name: /^取消收藏/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.goto('/account')
  await expect(page.locator('.activity-list')).toContainText('资源示例 1')
  await switchLanguage(page, 'en')
  await expect(page).toHaveURL(/\/en\/account$/)
  await expect(page.locator('.activity-list')).toContainText('Resource 1')
  await expect(page.locator('.activity-list')).not.toContainText('资源示例 1')
  await page.reload()
  await expect(page.locator('.activity-list')).toContainText('Resource 1')
  await switchLanguage(page, 'zh')
  await expect(page.locator('.activity-list')).toContainText('资源示例 1')
})

test('其他标签页退出后，个人中心恢复访客并离开私有页', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/account')
  await waitForHydration(page)
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  const other = await context.newPage()
  await other.goto('/resources')
  await waitForHydration(other)
  await other.locator('.app-header__user').click()
  await other.getByRole('button', { name: '退出登录', exact: true }).click()
  await other
    .getByRole('dialog')
    .getByRole('button', { name: /确\s*定/ })
    .click()
  await expect(page.locator('.app-header__user')).toHaveCount(0)
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('button', { name: /登\s*录/, exact: true })).toBeVisible()
  await expect
    .poll(async () => (await context.cookies()).some(cookie => cookie.name === AUTH_COOKIE_NAME))
    .toBe(false)
})

test('其他标签页重新登录后，现有页面使用新会话', async ({ page, context, baseURL }) => {
  const previous = testSession(2)
  await setSession(context, previous, baseURL!)
  await page.goto('/preview/article/resources/1')
  await waitForHydration(page)
  await expect(page.locator('.app-header__user')).toContainText('测试用户2')
  const other = await context.newPage()
  await other.goto('/resources')
  await waitForHydration(other)
  await other.locator('.app-header__user').click()
  await other.getByRole('button', { name: '退出登录', exact: true }).click()
  await other
    .getByRole('dialog')
    .getByRole('button', { name: /确\s*定/ })
    .click()
  await expect(page.locator('.app-header__user')).toHaveCount(0)
  await other.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await smsLogin(other)
  await expect(page.locator('.app-header__user')).toContainText('测试用户1')
  const sent = page.waitForRequest(request => request.url().endsWith('/api/v1/actions/like'))
  await page.getByRole('button', { name: /^点赞/ }).click()
  const request = await sent
  const cookie = (await context.cookies()).find(cookie => cookie.name === AUTH_COOKIE_NAME)!
  const token = decodeURIComponent(cookie.value)
  expect(token).not.toContain('profile')
  expect(request.headers().authorization).toBe(`Bearer ${token}`)
  expect(token).not.toBe(previous.token)
})
