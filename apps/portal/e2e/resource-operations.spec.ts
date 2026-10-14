import { expect, test, waitForHydration } from './academy.fixture'

test('资源仍支持新窗口打开详情，其他栏目卡片保持路由导航', async ({ page, context }) => {
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  const newTab = context.waitForEvent('page')
  await page
    .locator('[data-content-id="RESOURCE:2"] .content-card__link')
    .click({ modifiers: ['ControlOrMeta'] })
  const detail = await newTab
  await detail.waitForURL(/\/resources\/2$/)
  await expect(detail.locator('video')).toBeVisible()
  await expect(page).toHaveURL(/\/resources\?category=1$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await detail.close()
  await page.goto('/schools')
  await waitForHydration(page)
  await page.locator('.content-card__link').first().click()
  await expect(page).toHaveURL(/\/schools\/1$/)
})

test('默认分类及一级切换清除下级条件，搜索保留水平并清除其他条件', async ({ page }) => {
  await page.goto('/resources')
  await waitForHydration(page)
  await expect(page.locator('.content-list-feature__main > .ant-alert-warning')).toHaveCount(0)
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
  expect(query.get('pageSize')).toBe('60')
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

test('每页 60 条，翻页和刷新保持查询，筛选回到第一页', async ({ page }) => {
  await page.goto('/resources?keyword=分页样例')
  await waitForHydration(page)
  await expect(page.locator('.content-card')).toHaveCount(60)
  await page.getByRole('button', { name: '页 2', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('.content-card')).toHaveCount(12)
  await expect(page.locator('.content-card').first()).toContainText('分页样例 61')
  await page.reload()
  await expect(page.locator('.content-card')).toHaveCount(12)
  await page
    .getByRole('group', { name: '身体部位', exact: true })
    .getByRole('button', { name: '上肢', exact: true })
    .click()
  await expect(page).not.toHaveURL(/page=/)
  await expect(page.locator('.content-card')).toHaveCount(60)
})

test('列表资源页内预览，关闭保留条件，上报一次浏览并停掉播放器', async ({ page }) => {
  let reports = 0
  let recommendations = 0
  page.on('request', request => {
    if (request.url().includes('/api/v1/contents/view')) reports++
    if (request.url().includes('/api/v1/contents/recommend')) recommendations++
  })
  await page.goto('/resources?category=1&recommendedLevel=3')
  await waitForHydration(page)
  const originalUrl = page.url()
  await page.locator('[data-content-id="RESOURCE:2"] .content-card__link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('video')).toBeVisible()
  await expect(dialog.getByTestId('view-count')).toContainText('11')
  expect(reports).toBe(1)
  expect(recommendations).toBe(0)
  await expect(page).toHaveURL(originalUrl)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(page.locator('video')).toHaveCount(0)
  await expect(page).toHaveURL(originalUrl)
  await page.locator('[data-content-id="RESOURCE:3"] .content-card__link').click()
  await expect(page.getByRole('dialog').locator('audio')).toBeVisible()
  await expect.poll(() => reports).toBe(2)
})

test('弹窗收藏要求登录，登录后回放，图片和 PDF 使用现有预览', async ({ page }) => {
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  await page.locator('[data-content-id="RESOURCE:5"] .content-card__link').click()
  const preview = page.getByRole('dialog').filter({ has: page.locator('.resource-preview-dialog') })
  await expect(preview.locator('.media-preview__image')).toBeVisible()
  await preview.getByRole('button', { name: /^收藏/ }).click()
  const login = page.getByRole('dialog').filter({ has: page.locator('#login-phone') })
  await expect(login).toBeVisible()
  await login.locator('#login-phone').fill('13800138000')
  await login.getByRole('button', { name: '获取验证码', exact: true }).click()
  await expect(login.getByRole('button', { name: /秒后重发/ })).toBeVisible()
  await login.locator('#login-code').fill('123456')
  await login.getByRole('checkbox').check()
  await login.getByRole('button', { name: /登\s*录/, exact: true }).click()
  await expect(login).toBeHidden()
  await expect(preview.getByRole('button', { name: /^取消收藏/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.keyboard.press('Escape')
  await expect(preview).toBeHidden()
  await page.locator('[data-content-id="RESOURCE:4"] .content-card__link').click()
  await expect(page.getByRole('dialog').locator('.pdf-preview canvas')).toBeVisible()
})

test('弹窗失败可重试，关闭慢响应后不会覆盖新的预览', async ({ page }) => {
  await page.route('**/api/v1/resources/2', async route => {
    await new Promise(resolve => setTimeout(resolve, 800))
    await route.continue()
  })
  await page.goto('/resources?category=1')
  await waitForHydration(page)
  await page.locator('[data-content-id="RESOURCE:2"] .content-card__link').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.locator('[data-content-id="RESOURCE:9"] .content-card__link').click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('资源示例 9')
  await expect(dialog.getByRole('alert')).toContainText('媒体加载失败')
  await dialog.getByRole('button', { name: /重\s*试/, exact: true }).click()
  await expect(dialog.getByRole('alert')).toContainText('媒体加载失败')
  await expect(dialog).not.toContainText('资源示例 2')
})
