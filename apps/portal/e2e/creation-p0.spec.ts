import { api, expect, fault, login, setSession, smsLogin, test } from './academy.fixture'

test('创作中心并入管理后台：P0 下公开入口、/admin 创作路由与写接口全部关闭', async ({
  context,
}) => {
  // 创作已下线公开 /creation 入口，并入 /admin 且受 P1 门控；P0 下相关路由与旧地址均 404。
  for (const path of [
    '/creation',
    '/account/points',
    '/account/teacher',
    '/admin/creation',
    '/admin/works',
    '/admin/works/submit',
    '/admin/points',
    '/admin/courses',
  ])
    expect((await context.request.get(path)).status()).toBe(404)
  const session = await login(context)
  const response = await context.request.post('/api/academy/v1/points/exchange', {
    headers: { Authorization: session.token },
    data: { amount: 100, requestId: 'p0-disabled' },
  })
  expect(response.status()).toBe(404)
})

test('灵跃未登录后恢复授权，取消不关联，显式授权只进入模拟结果', async ({ page, context }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'AI 教案', exact: true }).click()
  await smsLogin(page, '18800000005')
  const dialog = page.getByRole('dialog', { name: '灵跃 Mock' })
  await expect(dialog.getByText('尚无同手机号关联账号，是否授权创建并关联演示账号？')).toBeVisible()
  await dialog.getByRole('button', { name: /^取\s*消$/ }).click()
  await page.getByRole('button', { name: 'AI 教案', exact: true }).click()
  await expect(dialog.getByRole('button', { name: '授权并继续' })).toBeVisible()
  await fault(context, 'lingyue/enter')
  await dialog.getByRole('button', { name: '授权并继续' }).click()
  await expect(dialog.getByText('请求失败，请重试')).toBeVisible()
  await dialog.getByRole('button', { name: '授权并继续' }).click()
  await expect(page).toHaveURL(/\/lingyue\/simulation$/)
  await expect(page.getByText('模拟免登成功', { exact: true })).toBeVisible()
  await expect(page.getByText('已完成站内模拟流程，未打开真实灵跃服务。')).toBeVisible()
})

test('已有同手机号演示账号无需创建授权', async ({ page, context, baseURL }) => {
  const session = await login(context)
  await setSession(context, session, baseURL!)
  await page.goto('/')
  await page.getByRole('button', { name: 'AI 教案', exact: true }).click()
  await expect(page).toHaveURL(/\/lingyue\/simulation$/)
  expect((await api(context, 'lingyue/enter', {}, session.token)).simulated).toBe(true)
  await page.reload()
  await expect(page.getByText('请先完成模拟关联流程', { exact: true })).toBeVisible()
})
