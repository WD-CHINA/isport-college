import { expect, test, waitForHydration } from './academy.fixture'

test('资源仍支持新窗口打开详情，其他栏目卡片保持路由导航', async ({ page, context }) => {
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  const newTab = context.waitForEvent('page')
  await page
    .locator('[data-content-id="RESOURCE:2"] .content-card__link')
    .click({ modifiers: ['ControlOrMeta'] })
  const detail = await newTab
  await expect(detail).toHaveURL('/preview/resource/resources/2')
  await expect(detail.getByTestId('video-preview')).toBeVisible()
  await expect(page).toHaveURL(/\/resources\?category=1$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await detail.close()
  await page.goto('/schools')
  await waitForHydration(page)
  await page.locator('.content-card__link').first().click()
  await expect(page).toHaveURL('/preview/article/schools/1')
})

test('默认分类及一级切换清除下级条件，搜索保留水平并清除其他条件', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await expect(page.locator('.ant-message-notice-warning')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '体能', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.goto(
    '/resources?category=1&secondCategoryId=10&bodyPartTagId=4&recommendedLevel=3&resourceType=2&page=2',
  )
  await waitForHydration(page)
  const nextRequest = page.waitForRequest(
    request =>
      request.url().includes('/api/v1/resources?') &&
      new URL(request.url()).searchParams.get('firstCategoryId') === '2',
  )
  await page.getByRole('button', { name: '专项运动', exact: true }).click()
  const query = new URL((await nextRequest).url()).searchParams
  expect(query.get('pageSize')).toBe('8')
  expect(query.get('pageNum')).toBe('1')
  expect(query.has('secondCategoryId')).toBe(false)
  expect(query.has('bodyPartTagId')).toBe(false)
  expect(query.get('recommendedLevel')).toBe('3')
  await expect(page.getByRole('group', { name: '身体部位', exact: true })).toHaveCount(0)
  await page.locator('.catalog-hero').getByRole('searchbox').fill('  资源示例 2  ')
  await page.locator('.catalog-hero').getByRole('button', { name: '搜索', exact: true }).click()
  await expect(page).toHaveURL(/category=1/)
  await expect(page).toHaveURL(/recommendedLevel=3/)
  expect(new URL(page.url()).searchParams.has('resourceType')).toBe(false)
  await expect(page.locator('.catalog-hero').getByRole('searchbox')).toHaveValue('资源示例 2')
  await page.getByRole('button', { name: '清除搜索', exact: true }).click()
  await expect(page).not.toHaveURL(/keyword=/)
  await expect(page.locator('.catalog-hero').getByRole('searchbox')).toBeFocused()
})

test('每页 8 条，翻页和刷新保持查询，筛选回到第一页', async ({ page }) => {
  await page.goto('/resources?keyword=分页样例')
  await waitForHydration(page)
  await expect(page.locator('.content-card')).toHaveCount(8)
  await page.getByRole('button', { name: '页 2', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('.content-card')).toHaveCount(8)
  await expect(page.locator('.content-card').first()).toContainText('分页样例 9')
  await page.reload()
  await waitForHydration(page)
  await expect(page.locator('.content-card')).toHaveCount(8)
  await page
    .getByRole('group', { name: '身体部位', exact: true })
    .getByRole('button', { name: '上肢', exact: true })
    .click()
  await expect(page).not.toHaveURL(/page=/)
  await expect(page.locator('.content-card')).toHaveCount(8)
})

test('列表资源点击进入详情页，上报一次浏览', async ({ page }) => {
  let reports = 0
  page.on('request', request => {
    if (request.url().includes('/api/v1/contents/view')) reports++
  })
  await page.goto('/resources?category=1&recommendedLevel=3')
  await waitForHydration(page)
  await page.locator('[data-content-id="RESOURCE:2"] .content-card__link').click()
  await expect(page).toHaveURL('/preview/resource/resources/2')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByTestId('video-preview')).toBeVisible()
  await expect(page.getByTestId('view-count')).toContainText('11')
  await expect.poll(() => reports).toBe(1)
  await page.goto('/resources?category=1&recommendedLevel=3')
  await page.locator('[data-content-id="RESOURCE:3"] .content-card__link').click()
  await expect(page).toHaveURL('/preview/resource/resources/3')
  await expect(page.getByTestId('audio-preview')).toBeVisible()
  await expect.poll(() => reports).toBe(2)
})

test('详情页收藏要求登录，登录后回放，图片和文档在详情页预览', async ({ page }) => {
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  await page.locator('[data-content-id="RESOURCE:5"] .content-card__link').click()
  await expect(page).toHaveURL('/preview/resource/resources/5')
  await expect(page.getByTestId('image-carousel')).toBeVisible()
  await page.getByRole('button', { name: /^收藏/ }).click()
  const login = page.getByRole('dialog').filter({ has: page.locator('#login-phone') })
  await expect(login).toBeVisible()
  await login.locator('#login-phone').fill('13800138000')
  await login.getByRole('button', { name: '获取验证码', exact: true }).click()
  await expect(login.getByRole('button', { name: /秒后重发/ })).toBeVisible()
  await login.locator('#login-code').fill('123456')
  await login.getByRole('checkbox').check()
  await login.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(login).toBeHidden()
  await expect(page.getByRole('button', { name: /^取消收藏/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.goto('/resources?category=1')
  await page.locator('[data-content-id="RESOURCE:4"] .content-card__link').click()
  await expect(page).toHaveURL('/preview/resource/resources/4')
  await expect(page.getByTestId('document-preview')).toBeVisible()
})

test('慢响应的旧详情不会覆盖后打开的资源', async ({ page }) => {
  await page.route('**/api/v1/resources/2', async route => {
    await new Promise(resolve => setTimeout(resolve, 800))
    await route.continue()
  })
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  await page.locator('[data-content-id="RESOURCE:2"] .content-card__link').click()
  await page.goto('/preview/resource/resources/9')
  await expect(page.getByRole('heading', { name: '资源示例 9', exact: true })).toBeVisible()
  await expect(page.locator('.ant-message-notice-error')).toContainText('媒体加载失败')
  await page.getByRole('button', { name: /重\s*试/, exact: true }).click()
  await expect(page.locator('.ant-message-notice-error')).toContainText('媒体加载失败')
  await expect(
    page.getByRole('heading', { level: 1, name: '资源示例 2', exact: true }),
  ).toHaveCount(0)
})
