import { expect, test, smsLogin, waitForHydration } from './academy.fixture'

for (const channel of ['resources', 'research', 'schools']) {
  test(`${channel} 的 ARTICLE 直出阅读正文并独立加载推荐`, async ({ page }) => {
    const response = await page.goto(`/preview/article/${channel}/10`)
    expect(response?.status()).toBe(200)
    expect(await response!.text()).toContain('文章详情布局回归正文。')
    await waitForHydration(page)
    const reading = page.locator('.article-detail__reading')
    await expect(reading.getByRole('heading', { level: 1 })).toHaveText('资源示例 10')
    await expect(reading.locator('.article-detail__summary')).toHaveText('教学资源示例')
    await expect(reading.locator('.article-detail__body img')).toHaveCount(2)
    await expect(reading.locator('script')).toHaveCount(0)
    await expect(reading.locator('.rich-text-content__toc')).toHaveCount(0)
    await expect(page.getByTestId('view-count')).toContainText('11')
    const recommendation = page.locator(
      channel === 'schools'
        ? '.article-detail__related .content-card__link'
        : '.article-detail__recommendations .content-recommendation',
    )
    await expect(recommendation).toHaveCount(1)
    await expect(recommendation).toHaveAttribute('href', `/preview/article/${channel}/1`)
    await recommendation.click()
    await expect(page).toHaveURL(new RegExp(`/preview/article/${channel}/1$`))
  })
}

test('文章图标收藏保留登录门禁与登录后回放', async ({ page }) => {
  await page.goto('/preview/article/schools/10')
  await waitForHydration(page)
  await page.getByRole('button', { name: /^收藏/ }).click()
  await smsLogin(page)
  await expect(page.getByRole('button', { name: /^取消收藏/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(page.getByRole('alert').filter({ hasText: '收藏成功' })).toBeVisible()
})

test('ARTICLE 在中英文小屏下按正文、推荐顺序排列，图片不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 })
  for (const prefix of ['', '/en']) {
    await page.goto(`${prefix}/preview/article/schools/10`)
    await waitForHydration(page)
    const reading = await page.locator('.article-detail__reading').boundingBox()
    const aside = page.locator('.article-detail__related')
    await expect(aside).toBeVisible()
    const recommendation = await aside.boundingBox()
    expect(recommendation!.y).toBeGreaterThanOrEqual(reading!.y + reading!.height)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const photos = page.locator('.article-detail__body img')
    const first = await photos.nth(0).boundingBox()
    const second = await photos.nth(1).boundingBox()
    expect(second!.y).toBeGreaterThan(first!.y)
  }
})

test('1440px 案例正文通栏，下方推荐使用三列卡片', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 })
  await page.goto('/preview/article/schools/10')
  await waitForHydration(page)
  const reading = await page.locator('.article-detail__reading').boundingBox()
  const related = page.locator('.article-detail__related')
  await expect(related).toBeVisible()
  expect(reading!.x).toBe(120)
  expect(reading!.width).toBe(1200)
  expect((await related.boundingBox())!.y).toBeGreaterThan(reading!.y + reading!.height)
  await expect(related.getByRole('heading', { name: '大家都在看' })).toBeVisible()
  expect((await related.locator('.content-card').first().boundingBox())!.width).toBe(384)
  await expect(page.locator('.article-detail__recommendations')).toHaveCount(0)
})

test('行业动态 ARTICLE 复用阅读布局并保留正文 SSR', async ({ page }) => {
  const response = await page.goto('/news/1')
  expect(await response!.text()).toContain('动态正文')
  await expect(page.locator('.article-detail__reading h1')).toHaveText('行业动态示例')
  await expect(page.locator('.article-detail__recommendations')).toHaveCount(0)
})
