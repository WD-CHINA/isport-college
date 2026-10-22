import { expect, test, waitForHydration } from './academy.fixture'

for (const [channel, count] of [
  ['resources', 8],
  ['research', 4],
  ['schools', 6],
] as const) {
  test(`${channel} 按设计稿分页，内页仅保留版权页脚`, async ({ page }) => {
    await page.goto('/')
    await waitForHydration(page)
    await expect(page.locator('.app-footer__inner')).toBeVisible()
    const response = page.waitForResponse(response => {
      const url = new URL(response.url())
      return url.pathname === `/api/v1/${channel}`
    })
    await page.locator(`.app-header__nav a[href="/${channel}"]`).click()
    expect(new URL((await response).url()).searchParams.get('pageSize')).toBe(String(count))
    await expect(page.locator('.content-card')).toHaveCount(count)
    await expect(page.locator('.app-footer--compact .app-footer__copy')).toBeVisible()
    await expect(page.locator('.app-footer__inner')).toHaveCount(0)
  })
}

test('教研首屏默认教学实践，四个文字分类与真实查询同步', async ({ page }) => {
  const requests: string[] = []
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/api/v1/research') requests.push(request.url())
  })
  const response = await page.goto('/research')
  expect(await response!.text()).toContain('aria-pressed="true"')
  await waitForHydration(page)
  await expect(page).toHaveURL(/\/research\?category=SERIES$/)
  const tabs = page.locator('.catalog-category-tabs')
  await expect(tabs.getByRole('button')).toHaveCount(4)
  await expect(tabs.getByRole('button', { name: '教学实践', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(requests).toHaveLength(0)
  const changed = page.waitForRequest(request => {
    const url = new URL(request.url())
    return (
      url.pathname === '/api/v1/research' && url.searchParams.get('categoryCode') === 'RESEARCH'
    )
  })
  await tabs.getByRole('button', { name: '教研与专业发展', exact: true }).click()
  await changed
  await expect(page).toHaveURL(/category=RESEARCH/)
  await expect(page.locator('.content-list-feature__heading h2')).toHaveText('教研与专业发展')
  await page.reload()
  await expect(tabs.getByRole('button', { name: '教研与专业发展', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})

test('学校案例使用三个文字分类，分类切换与查看案例保留真实路由', async ({ page }) => {
  await page.goto('/schools')
  await waitForHydration(page)
  const tabs = page.locator('.catalog-category-tabs')
  await expect(tabs.getByRole('button')).toHaveCount(3)
  await expect(tabs.getByRole('button', { name: '全部案例', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await tabs.getByRole('button', { name: '校本课程建设', exact: true }).click()
  await expect(page).toHaveURL(/category=CURRICULUM/)
  await expect(page.locator('.content-list-feature__heading h2')).toHaveText('校本课程建设')
  await page.locator('.content-card__link').first().click()
  await expect(page).toHaveURL('/preview/article/schools/1')
  await expect(
    page.getByRole('heading', { level: 1, name: '资源示例 1', exact: true }),
  ).toBeVisible()
})

test('学校案例副标题读取 summary，空值不显示副标题', async ({ page }) => {
  const response = await page.goto('/schools')
  expect(await response!.text()).toContain('教学资源示例</p>')
  await waitForHydration(page)
  const summary = page.locator('[data-content-id="SCHOOL:1"] .content-card__summary')
  await expect(summary).toHaveText('教学资源示例')
  await expect(summary).toBeVisible()
  await expect(page.locator('[data-content-id="SCHOOL:2"] .content-card__summary')).toHaveCount(0)
  await page.locator('.content-grid--school').screenshot({
    path: 'test-results/school-card-summary.png',
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(summary).toBeVisible()
  await expect(summary).toHaveCSS('-webkit-line-clamp', '2')
})

test('资源顶部搜索清除旧筛选，按返回的默认分类筛选并可继续重置', async ({ page }) => {
  await page.goto('/resources?category=2&recommendedLevel=3&resourceType=0&page=2')
  await waitForHydration(page)
  const searched = page.waitForRequest(request => {
    const url = new URL(request.url())
    return url.pathname === '/api/v1/resources' && url.searchParams.get('keyword') === '资源'
  })
  await page.locator('.catalog-hero').getByRole('searchbox').fill('资源')
  await page.locator('.catalog-hero').getByRole('button', { name: '搜索', exact: true }).click()
  const params = new URL((await searched).url()).searchParams
  for (const key of ['secondCategoryId', 'recommendedLevel', 'bodyPartTagId', 'type'])
    expect(params.has(key)).toBe(false)
  expect(params.get('pageNum')).toBe('1')
  expect(params.get('firstCategoryId')).toBe('1')
  await expect(page).toHaveURL(/category=1&keyword=/)
  await expect(page.locator('.content-filters__categories [aria-pressed="true"]')).toHaveText([
    '体能',
  ])
  await page.getByRole('button', { name: '体能', exact: true }).click()
  await page
    .getByRole('group', { name: '二级分类', exact: true })
    .getByRole('button', { name: '力量', exact: true })
    .click()
  await expect(page).toHaveURL(/secondCategoryId=10/)
  await page.getByRole('button', { name: '重置筛选', exact: true }).click()
  await expect(page).toHaveURL(/\/resources\?category=1$/)
  await expect(page.locator('.catalog-hero').getByRole('searchbox')).toHaveValue('')
})

for (const width of [1440, 390]) {
  test(`${width}px 资源类型可选课件，发送 type=99 且刷新后保留`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/resources?category=1')
    await waitForHydration(page)
    const typeSelect = page.locator('.content-filters__field .ant-select').last()
    await typeSelect.click()
    const option = page.locator('.ant-select-item-option[title="课件"]')
    await expect(option).toHaveCount(1)
    const changed = page.waitForRequest(request => {
      const url = new URL(request.url())
      return url.pathname === '/api/v1/resources' && url.searchParams.get('type') === '99'
    })
    await option.click()
    await changed
    await expect(page).toHaveURL(/resourceType=99/)
    await expect(page.locator('.content-filters__field .ant-select').last()).toContainText('课件')
    await page.reload()
    await waitForHydration(page)
    await expect(page).toHaveURL(/resourceType=99/)
    await expect(page.locator('.content-filters__field .ant-select').last()).toContainText('课件')
    await page.locator('.content-filters__categories button').nth(1).click()
    await expect(page).not.toHaveURL(/resourceType=/)
    await expect(page.locator('.content-filters__field .ant-select').last()).toContainText('全部')
  })

  test(`${width}px 全部资源搜索无结果时隐藏筛选和列表，清除搜索后恢复`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/resources?category=2&recommendedLevel=3&resourceType=0')
    await waitForHydration(page)
    const hero = page.locator('.catalog-hero')
    await hero.getByRole('searchbox').fill('不存在的教学资源')
    await hero.getByRole('button', { name: '搜索', exact: true }).click()
    const empty = page.locator('.content-list-feature__search-empty')
    await expect(empty).toContainText('没有找到相关教学资源，请换个关键词试试。')
    await expect(page.locator('.content-filters')).toHaveCount(0)
    await expect(page.locator('.content-grid')).toHaveCount(0)
    await expect(page.locator('.app-pagination')).toHaveCount(0)
    await expect(page).toHaveURL(/category=1&keyword=/)
    const response = await page.reload()
    const html = await response!.text()
    expect(html).not.toContain('class="content-filters')
    expect(html).toContain('没有找到相关教学资源，请换个关键词试试。')
    await waitForHydration(page)
    await expect(empty).toBeVisible()
    await hero.getByRole('button', { name: '清除搜索', exact: true }).click()
    await expect(page).toHaveURL(/\/resources\?category=1$/)
    await expect(page.locator('.content-filters')).toBeVisible()
    await expect(page.locator('.content-card')).toHaveCount(8)
    await expect(empty).toHaveCount(0)
  })
}

for (const [channel, category] of [
  ['research', 'RESEARCH'],
  ['schools', 'CURRICULUM'],
] as const) {
  test(`${channel} 移除搜索入口，分类切换与刷新仍保留结果`, async ({ page }) => {
    await page.goto(`/${channel}`)
    await waitForHydration(page)
    await expect(page.locator('.content-filters__search-toggle')).toHaveCount(0)
    await expect(page.locator('.content-filters').getByRole('textbox')).toHaveCount(0)
    const categoryButton = page.locator('.catalog-category-tabs').getByRole('button').nth(1)
    await categoryButton.click()
    await expect(page).toHaveURL(new RegExp(`category=${category}`))
    await page.reload()
    await expect(categoryButton).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('.content-card').first()).toContainText('资源示例 1')
  })
}

for (const width of [320, 390]) {
  for (const locale of ['zh', 'en']) {
    test(`栏目与登录弹窗在 ${width}px ${locale} 下完整可用`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      const prefix = locale === 'en' ? '/en' : ''
      for (const channel of ['resources', 'research', 'schools']) {
        await page.goto(`${prefix}/${channel}`)
        await waitForHydration(page)
        await expect(page.locator('.catalog-hero h1')).toBeVisible()
        await expect(page.locator('.content-filters__search-toggle')).toHaveCount(0)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        await expect(page.locator('.app-footer--compact .app-footer__copy')).toBeVisible()
      }
      await page.locator('.app-header__burger').click()
      await page
        .locator('.app-header__panel')
        .getByRole('button', { name: locale === 'en' ? 'Sign in' : /登\s*录/, exact: true })
        .click()
      const dialog = page.getByRole('dialog')
      await expect(dialog.locator('#login-phone')).toBeVisible()
      await expect(dialog.locator('#login-code')).toBeVisible()
      await expect(dialog.getByRole('checkbox')).toBeVisible()
      const bounds = await dialog.boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      await page.keyboard.press('Escape')
      await expect(dialog).toBeHidden()
    })
  }
}
