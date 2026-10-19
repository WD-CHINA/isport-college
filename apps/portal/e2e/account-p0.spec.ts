import { expect, test, setSession, testSession, waitForHydration } from './academy.fixture'
import type { APIRequestContext } from '@playwright/test'

async function relate(
  request: APIRequestContext,
  token: string,
  action: string,
  channel: string,
  originId: number,
) {
  const response = await request.post(
    `http://127.0.0.1:${process.env.E2E_API_PORT ?? 3200}/api/v1/actions/${action}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { channel, origin: 'PLATFORM', originId },
    },
  )
  expect(response.ok()).toBe(true)
}

test('昵称可确认保存空值并同步页头，头像统一显示静态占位图', async ({ page, context, baseURL }) => {
  const avatarRequests: string[] = []
  page.on('request', request => {
    if (/\/api\/v1\/(avatars|me\/avatar)$/.test(new URL(request.url()).pathname)) {
      avatarRequests.push(request.url())
    }
  })
  await setSession(context, testSession(), baseURL!)
  await page.goto('/account')
  await waitForHydration(page)
  const profile = page.locator('.account-profile')
  await profile.getByRole('button', { name: /编\s*辑/, exact: true }).click()
  const form = profile.locator('.profile-form')
  await form.getByRole('textbox').fill('新昵称')
  await form.getByRole('button', { name: /确\s*定/, exact: true }).click()
  await expect(form).toHaveCount(0)
  await expect(profile.getByRole('heading')).toHaveText('新昵称')
  await expect(page.locator('.app-header__user')).toContainText('新昵称')
  await profile.getByRole('button', { name: /编\s*辑/, exact: true }).click()
  await form.getByRole('textbox').fill('')
  const saved = page.waitForRequest('**/api/v1/me/nickname')
  await form.getByRole('button', { name: /确\s*定/, exact: true }).click()
  expect((await saved).postDataJSON()).toEqual({ nickname: '' })
  await expect(form).toHaveCount(0)
  await expect(page.locator('.app-header__user')).not.toContainText('新昵称')
  await expect(profile.getByRole('button', { name: '选择头像', exact: true })).toHaveCount(0)
  await expect(profile.locator('.avatar-picker')).toHaveCount(0)
  await expect(profile.locator('.account-avatar img')).toHaveAttribute(
    'src',
    '/auth/default-avatar.png',
  )
  await expect(page.locator('.app-header__user .account-avatar img')).toHaveAttribute(
    'src',
    '/auth/default-avatar.png',
  )
  await page.reload()
  await waitForHydration(page)
  await expect(profile.locator('.account-avatar img')).toHaveAttribute(
    'src',
    '/auth/default-avatar.png',
  )
  expect(avatarRequests).toEqual([])
})

test('有效关系跨空白页汇总；分类不改变 Tab 总数；收藏和点赞独立取消', async ({
  page,
  context,
  baseURL,
}) => {
  const session = testSession()
  await setSession(context, session, baseURL!)
  for (const channel of ['RESOURCE', 'RESEARCH', 'SCHOOL'])
    await relate(context.request, session.token, 'favorite', channel, 1)
  await Promise.all(
    Array.from({ length: 55 }, (_, i) =>
      relate(context.request, session.token, 'favorite', 'RESOURCE', 101 + i),
    ),
  )
  await relate(context.request, session.token, 'like', 'RESOURCE', 1)
  await relate(context.request, session.token, 'like', 'SCHOOL', 1)
  await page.goto('/account')
  await waitForHydration(page)
  await expect(page.getByRole('tab', { name: '我的收藏 (3)', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByRole('tab', { name: '我的点赞 (2)', exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('.activity-list .content-card')
        .evaluateAll(nodes => nodes.map(node => node.getAttribute('data-content-id'))),
    )
    .toEqual(['SCHOOL:1', 'RESEARCH:1', 'RESOURCE:1'])
  await page.getByRole('button', { name: '教学资源', exact: true }).click()
  await expect(page.locator('.activity-list .content-card')).toHaveCount(1)
  await expect(page.getByRole('tab', { name: '我的收藏 (3)', exact: true })).toBeVisible()
  await page
    .locator('.activity-list')
    .getByRole('button', { name: /^取消收藏/ })
    .click()
  await expect(page.getByRole('tab', { name: '我的收藏 (2)', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: '我的点赞 (2)', exact: true })).toBeVisible()
  await expect(page.locator('.activity-list__empty')).toContainText('我的收藏')
  await expect(page.locator('.activity-list__empty a')).toHaveAttribute('href', '/resources')
  await page.getByRole('tab', { name: '我的点赞 (2)', exact: true }).click()
  await expect(page.locator('[data-content-id="RESOURCE:1"]')).toBeVisible()
  await page.getByRole('button', { name: '学校案例', exact: true }).click()
  await page
    .locator('.activity-list')
    .getByRole('button', { name: /^取消点赞/ })
    .click()
  await expect(page.getByRole('tab', { name: '我的点赞 (1)', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: '我的收藏 (2)', exact: true })).toBeVisible()
  await page.getByRole('tab', { name: '我的收藏 (2)', exact: true }).click()
  await expect(page.locator('[data-content-id="SCHOOL:1"]')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('tab', { name: '我的收藏 (2)', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: '我的点赞 (1)', exact: true })).toBeVisible()
})

test('空收藏和空点赞分别展示空态，浏览入口跟随分类', async ({ page, context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  await page.goto('/account')
  await waitForHydration(page)
  await expect(page.locator('.activity-list__empty')).toContainText('我的收藏')
  await page.getByRole('tab', { name: '我的点赞 (0)', exact: true }).click()
  await page.getByRole('button', { name: '学校案例', exact: true }).click()
  await expect(page.locator('.activity-list__empty')).toContainText('我的点赞')
  await expect(page.locator('.activity-list__empty a')).toHaveAttribute('href', '/schools')
})

test('取消最后一页唯一收藏后返回上一页，计数和刷新结果一致', async ({ page, context, baseURL }) => {
  const session = testSession()
  await setSession(context, session, baseURL!)
  for (let id = 1; id <= 13; id++)
    await relate(context.request, session.token, 'favorite', 'RESOURCE', id)
  await page.goto('/account')
  await waitForHydration(page)
  await expect(page.locator('.activity-list .content-card')).toHaveCount(12)
  await page.getByRole('button', { name: '页 2', exact: true }).click()
  await expect(page.locator('.activity-list .content-card')).toHaveCount(1)
  await page
    .locator('.activity-list')
    .getByRole('button', { name: /^取消收藏/ })
    .click()
  await expect(page.locator('.activity-list .content-card')).toHaveCount(12)
  await expect(page.getByRole('tab', { name: '我的收藏 (12)', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('tab', { name: '我的收藏 (12)', exact: true })).toBeVisible()
})

test('新注册无需选择头像，忽略头像编号且不提交头像数据', async ({ page }) => {
  const avatarRequests: string[] = []
  page.on('request', request => {
    if (/\/api\/v1\/(avatars|me\/avatar)$/.test(new URL(request.url()).pathname)) {
      avatarRequests.push(request.url())
    }
  })
  await page.route('**/api/v1/auth/login', async route => {
    const response = await route.fetch()
    const envelope = await response.json()
    envelope.data.newUser = true
    envelope.data.profile.avatarCode = 7
    envelope.data.profile.nicknamePromptNeeded = true
    await route.fulfill({ response, json: envelope })
  })
  await page.goto('/resources')
  await waitForHydration(page)
  await page.getByRole('button', { name: /登\s*录/, exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#login-phone').fill('13800138000')
  const smsRequest = page.waitForRequest('**/api/v1/auth/sms')
  await dialog.getByRole('button', { name: '获取验证码', exact: true }).click()
  expect((await smsRequest).postDataJSON()).toEqual({ phone: '13800138000' })
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toBeVisible()
  await dialog.locator('#login-code').fill('123456')
  await dialog.getByRole('checkbox').check()
  const loginRequest = page.waitForRequest('**/api/v1/auth/login')
  await dialog.getByRole('button', { name: /登\s*录/, exact: true }).click()
  expect((await loginRequest).postDataJSON()).toEqual({
    phone: '13800138000',
    code: '123456',
    agreed: true,
  })
  await expect(page.locator('.nickname-guide')).toBeVisible()
  await expect(page.locator('.avatar-picker')).toHaveCount(0)
  await expect(page.locator('.app-header__user .account-avatar img')).toHaveAttribute(
    'src',
    '/auth/default-avatar.png',
  )
  await page.getByRole('button', { name: '暂不填写', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.goto('/account')
  await waitForHydration(page)
  await expect(page.locator('.account-profile .account-avatar img')).toHaveAttribute(
    'src',
    '/auth/default-avatar.png',
  )
  await expect(page.getByRole('button', { name: '选择头像', exact: true })).toHaveCount(0)
  expect(avatarRequests).toEqual([])
})

test('内容在操作前失效时，同时同步两类有效列表和计数', async ({ page, context, baseURL }) => {
  const session = testSession()
  await setSession(context, session, baseURL!)
  for (const action of ['like', 'favorite'])
    await relate(context.request, session.token, action, 'RESOURCE', 1)
  await page.goto('/account')
  await waitForHydration(page)
  await expect(page.getByRole('tab', { name: '我的收藏 (1)', exact: true })).toBeVisible()
  await page.route('**/api/v1/actions/favorite', route =>
    route.fulfill({ status: 404, json: { status: 404, message: '内容已下架', data: null } }),
  )
  await page.route('**/api/v1/me/actions?*', async route => {
    const response = await route.fetch()
    const envelope = await response.json()
    envelope.data.list = []
    await route.fulfill({ response, json: envelope })
  })
  await page
    .locator('.activity-list')
    .getByRole('button', { name: /^取消收藏/ })
    .click()
  await expect(page.getByRole('tab', { name: '我的收藏 (0)', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: '我的点赞 (0)', exact: true })).toBeVisible()
  await expect(page.locator('.activity-list__empty')).toBeVisible()
})
