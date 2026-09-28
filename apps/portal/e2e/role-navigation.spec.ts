import { expect, login, setSession, test } from './academy.fixture'

test.describe('P1 角色导航', () => {
  test.skip(process.env.E2E_PHASE !== 'p1', '仅在 P1 路由开启时验证角色导航')

  test('审核角色只看到已实现且有权限的创作路由', async ({ page, context, baseURL }) => {
    const session = await login(context, '18800000002')
    await setSession(context, session, baseURL!)
    await page.goto('/resources')

    const header = page.locator('.app-header__nav')
    await expect(header.locator('a[href="/admin/creation"]')).toHaveCount(1)
    await expect(header.getByRole('link', { name: '管理后台' })).toHaveCount(0)
    await expect(page.locator('a[href="/admin/reviews"]')).toHaveCount(0)
    await expect(page.locator('a[href="/admin/content"]')).toHaveCount(0)

    await page.goto('/admin/creation')
    const menu = page.locator('.admin-sider__menu')
    await expect(menu.getByText('创作中心', { exact: true })).toBeVisible()
    await expect(menu.getByText('工作台', { exact: true })).toHaveCount(0)
    await expect(menu.getByText('课程管理', { exact: true })).toHaveCount(0)
  })

  test('运营角色看到已实现的后台路由且不生成占位链接', async ({ page, context, baseURL }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', error => pageErrors.push(error))

    const session = await login(context, '18800000003')
    await setSession(context, session, baseURL!)
    await page.goto('/resources')

    const header = page.locator('.app-header__nav')
    await expect(header.getByRole('link', { name: '管理后台' })).toHaveAttribute('href', '/admin')
    await expect(page.locator('a[href="/admin/reviews"]')).toHaveCount(0)
    await expect(page.locator('a[href="/admin/content"]')).toHaveCount(0)

    await page.goto('/admin')
    const menu = page.locator('.admin-sider__menu')
    await expect(menu.getByText('工作台', { exact: true })).toBeVisible()
    await expect(menu.getByText('课程管理', { exact: true })).toBeVisible()
    await expect(menu.getByText('创作中心', { exact: true })).toBeVisible()

    await menu.getByText('课程管理', { exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/courses$/)
    await menu.getByText('创作中心', { exact: true }).click()
    await menu.getByText('创作概览', { exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/creation$/)
    await menu.getByText('我的创作', { exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/works$/)
    await menu.getByText('我的积分', { exact: true }).click()
    await expect(page).toHaveURL(/\/admin\/points$/)
    await menu.getByText('工作台', { exact: true }).click()
    await expect(page).toHaveURL(/\/admin$/)
    expect(pageErrors).toEqual([])
  })
})
