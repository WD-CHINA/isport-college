import { AUTH_COOKIE_NAME } from '@isport/shared'
import { api, expect, fault, login, setSession, smsLogin, test } from './academy.fixture'

test('直接访问个人页恢复登录目标，刷新会话有效且退出必须确认', async ({ page }) => {
  await page.goto('/account')
  await smsLogin(page)
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByText('188****0001')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: '个人信息' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.locator('.app-header__actions').getByRole('button', { name: '退出登录' }).click()
  const confirm = page.getByRole('dialog', { name: '退出登录' })
  await confirm.getByRole('button', { name: /^取\s*消$/ }).click()
  await expect(page).toHaveURL(/\/account$/)
  await page.locator('.app-header__actions').getByRole('button', { name: '退出登录' }).click()
  await confirm.getByRole('button', { name: /^确\s*定$/ }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.locator('.app-header__actions').getByRole('button', { name: /^登\s*录$/ }),
  ).toBeVisible()
})

test('新账号跳过昵称后恢复收藏一次，点赞独立，取消与切号不串数据', async ({
  page,
  context,
  baseURL,
}) => {
  await page.goto('/resources/2')
  await page.getByRole('button', { name: /^收藏/ }).click()
  await smsLogin(page, '18800000111')
  const guide = page.getByRole('dialog', { name: '欢迎加入，设置你的昵称' })
  await expect(guide).toBeVisible()
  await guide.getByRole('button', { name: '暂时跳过' }).click()
  await expect(page.getByRole('button', { name: /^取消收藏/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('button', { name: /^点赞/ }).click()
  await expect(page.getByRole('button', { name: /^取消点赞/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.goto('/account')
  await expect(page.getByRole('button', { name: '我的收藏 (1)' })).toBeVisible()
  await expect(page.getByRole('button', { name: '我的点赞 (1)' })).toBeVisible()
  await page.locator('.activity-filters').getByRole('button', { name: '学校案例' }).click()
  await expect(page.getByRole('button', { name: '我的收藏 (1)' })).toBeVisible()
  await expect(page.locator('.activity-list__empty')).toBeVisible()
  await page
    .locator('.activity-filters')
    .getByRole('button', { name: /^全\s*部$/ })
    .click()
  await fault(context, 'interaction/set')
  await page.getByRole('button', { name: '取消收藏', exact: true }).click()
  await expect(page.getByText('操作失败，尚未确认变更；请重试。')).toBeVisible()
  await expect(page.locator('.content-card')).toHaveCount(1)
  await page.getByRole('button', { name: '取消收藏', exact: true }).click()
  await expect(page.getByRole('button', { name: '我的收藏 (0)' })).toBeVisible()
  await page.getByRole('button', { name: '我的点赞 (1)' }).click()
  await expect(page.locator('.content-card')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const second = await login(context, '18800000005')
  await setSession(context, second, baseURL!)
  await page.reload()
  await expect(page.getByRole('button', { name: '我的点赞 (0)' })).toBeVisible()
  await expect(page.getByRole('button', { name: '我的收藏 (0)' })).toBeVisible()
})

test('昵称保存失败保留输入，成功同步并持久化头像，允许清空', async ({ page, context, baseURL }) => {
  const session = await login(context)
  await setSession(context, session, baseURL!)
  await page.goto('/account')
  await page.getByRole('button', { name: /^编\s*辑$/ }).click()
  await page.getByRole('textbox', { name: '昵称' }).fill('新老师')
  await page.getByRole('radio', { name: '游泳' }).check()
  await fault(context, 'account/profile')
  await page.getByRole('button', { name: /^保\s*存$/ }).click()
  await expect(page.getByRole('textbox', { name: '昵称' })).toHaveValue('新老师')
  await expect(page.locator('.profile-form .ant-alert')).toBeVisible()
  await page.getByRole('button', { name: /^保\s*存$/ }).click()
  await expect(page.getByText('资料已保存')).toBeVisible()
  const me = await api(context, 'account/me', {}, session.token)
  expect(me.name).toBe('新老师')
  expect(me.avatar).toBe('swimmer')
  await page.reload()
  await expect(page.locator('.account-profile')).toContainText('新老师')
  await page.getByRole('button', { name: /^编\s*辑$/ }).click()
  await page.getByRole('textbox', { name: '昵称' }).fill('')
  await page.getByRole('button', { name: /^保\s*存$/ }).click()
  await expect(page.locator('.account-profile')).toContainText('未设置昵称')
})

test('短信倒计时按手机号隔离，关闭登录取消互动意图', async ({ page }) => {
  await page.goto('/resources/2')
  await page.getByRole('button', { name: /^收藏/ }).click()
  const dialog = page.getByRole('dialog', { name: '登录融梦学苑' })
  await dialog.locator('#login-phone').fill('18800000001')
  await dialog.getByRole('button', { name: '获取验证码' }).click()
  await expect(dialog.getByRole('button', { name: /秒后重发/ })).toBeDisabled()
  await dialog.locator('#login-phone').fill('18800000005')
  await expect(dialog.getByRole('button', { name: '获取验证码' })).toBeEnabled()
  await dialog.locator('.ant-modal-close').click()
  await page
    .locator('.app-header__actions')
    .getByRole('button', { name: /^登\s*录$/ })
    .click()
  await smsLogin(page, '18800000005')
  await expect(page.getByRole('button', { name: /^收藏/ })).toHaveAttribute('aria-pressed', 'false')
})

test('损坏的 Cookie 不导致 SSR 崩溃，也不能伪造登录', async ({ context, baseURL }) => {
  for (const value of [
    { token: 'fake', user: {} },
    { token: '', user: { id: 'admin', name: 'x', phone: '', avatar: 'ball', roles: ['admin'] } },
  ]) {
    await context.addCookies([
      { name: AUTH_COOKIE_NAME, value: encodeURIComponent(JSON.stringify(value)), url: baseURL! },
    ])
    const response = await context.request.get('/')
    expect(response.status()).toBe(200)
    expect(await response.text()).not.toContain('app-header__user')
  }
})
