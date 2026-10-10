import { expect, test, setSession, testSession } from './academy.fixture'

test('访客直达私有页触发登录并返回公开页', async ({ page }) => {
  await page.goto('/account')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page).toHaveURL(/\/$/)
})
for (const path of [
  '/admin',
  '/en/admin',
  '/Admin/courses',
  '/en/ADMIN/works',
  '/admin/creation',
  '/admin/points',
]) {
  test(`普通用户无权访问 ${path}，大小写与语言前缀一致`, async ({ page, context, baseURL }) => {
    await setSession(context, testSession(), baseURL!)
    const response = await page.goto(path)
    expect(response?.headers()['x-robots-tag']).toBe('noindex, nofollow, noarchive')
    await expect(page.getByText(/当前账号没有访问权限|does not have permission/)).toBeVisible()
  })
}
test('个人中心 SSR 与畸形 URL 保持真实状态码', async ({ context, baseURL }) => {
  await setSession(context, testSession(), baseURL!)
  expect((await context.request.get('/account')).status()).toBe(200)
  for (const path of ['/resources/999', '/teachers/999', '/news/999']) {
    const response = await context.request.get(path)
    expect(response.status(), path).toBe(404)
    expect(await response.text()).toContain('内容不存在')
  }
})

test('后端以 400 表示下架时，内容详情 SSR 仍返回 404', async ({ request }) => {
  for (const path of ['/resources/998', '/teachers/998', '/news/998']) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(404)
    expect(await response.text()).toContain('内容不存在')
  }
})
