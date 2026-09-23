import { test, expect, api, login, setNamespace, setSession } from './academy.fixture'

test('同源接口、私有缓存、控制凭据、旧代理与 P0 隔离', async ({ context }) => {
  const list = await api(context, 'content/list', { channel: 'resource' })
  expect(list.total).toBeGreaterThan(12)
  const response = await context.request.post('/api/academy/v1/content/list', { data: {} })
  expect(response.headers()['cache-control']).toContain('no-store')
  expect(response.headers()['x-robots-tag']).toContain('noindex')
  expect(
    (
      await context.request.post('/api/academy/mock/control', { data: { action: 'reset' } })
    ).status(),
  ).toBe(404)
  expect((await context.request.get('/rsp/resource/platform/list')).status()).toBe(503)
  expect(
    (await context.request.post('/api/academy/v1/not/implemented', { data: {} })).status(),
  ).toBe(404)
  expect(
    (
      await context.request.post('/api/academy/v1/auth/challenge', {
        data: { phone: '18800000001' },
        headers: { origin: 'https://untrusted.example' },
      })
    ).status(),
  ).toBe(403)
  if (process.env.E2E_PHASE !== 'p1') {
    expect((await context.request.post('/api/academy/v1/work/list', { data: {} })).status()).toBe(
      404,
    )
  }
})

test('跨角色共享命名空间但私人数据不串，刷新保留服务器状态', async ({
  browser,
  context,
  namespace,
  baseURL,
}) => {
  const first = await login(context)
  const secondContext = await browser.newContext({ baseURL })
  try {
    await setNamespace(secondContext, namespace, baseURL!)
    const second = await login(secondContext, '18800000005')
    await api(context, 'interaction/set', { id: '1', kind: 'like', active: true }, first.token)
    expect(
      (await api(secondContext, 'content/detail', { id: '1' }, second.token)).stats,
    ).toMatchObject({ likes: 1, liked: false })
    expect(
      (await api(secondContext, 'interaction/list', { kind: 'like' }, second.token)).total,
    ).toBe(0)
    expect((await api(context, 'interaction/list', { kind: 'like' }, first.token)).total).toBe(1)
    await setNamespace(secondContext, `other-${namespace}`, baseURL!)
    expect((await api(secondContext, 'content/detail', { id: '1' })).stats.likes).toBe(0)
  } finally {
    await secondContext.close()
  }
})

test('SSR 身份从 token 恢复，不接受 Cookie 伪造的昵称或角色', async ({ context, baseURL }) => {
  const session = await login(context)
  await setSession(
    context,
    { ...session, user: { ...session.user, name: '伪造昵称', roles: ['admin'] } },
    baseURL!,
  )
  const response = await context.request.get('/legal/terms')
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('体育老师')
  expect(html).not.toContain('伪造昵称')
  expect(html).toContain('Mock')
})
