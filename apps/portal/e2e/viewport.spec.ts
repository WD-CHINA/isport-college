import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * 移动端视口回归：页面内容宽度不得超出视口（全局 border-box 盒模型）。
 * normalize.css 不预设盒模型，UnoCSS 的 w-full + px-* 组合在 content-box 下会溢出 32px。
 */
test.use({ viewport: { width: 390, height: 844 } })

async function expectNoHorizontalScrollbar(page: Page) {
  const overflowX = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflowX, '横向溢出宽度（px）').toBeLessThanOrEqual(0)
}

test('移动端首页无横向滚动条', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '精选课程' })).toBeVisible()
  await expectNoHorizontalScrollbar(page)
})

test('移动端课程列表页无横向滚动条', async ({ page }) => {
  await page.goto('/courses')
  await expect(page.getByRole('heading', { name: '课程中心' })).toBeVisible()
  await expectNoHorizontalScrollbar(page)
})

test('移动端课程详情页无横向滚动条', async ({ page }) => {
  await page.goto('/courses/c-001')
  await expect(page.locator('.course-detail__name')).toBeVisible()
  await expectNoHorizontalScrollbar(page)
})

test('移动端英文路由无横向滚动条', async ({ page }) => {
  // 英文文案更长，是最容易撑破容器宽度的场景
  await page.goto('/en')
  await expect(page.getByRole('heading', { name: 'Featured Courses' })).toBeVisible()
  await expectNoHorizontalScrollbar(page)
})

test('移动端管理端登录后无横向滚动条', async ({ page }) => {
  await page.goto('/admin')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await dialog.locator('#login-phone').fill('188 8888 8888')
  await dialog.locator('#login-password').fill('123456')
  await dialog.getByRole('button', { name: /登\s*录|Sign In/ }).click()
  await expect(page.locator('.admin-header__user')).toBeVisible()
  await expect(page.getByText('课程总数')).toBeVisible()
  await expectNoHorizontalScrollbar(page)
})
