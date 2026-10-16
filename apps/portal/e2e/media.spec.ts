import { expect, test, waitForHydration } from './academy.fixture'

test('推荐服务失败不影响 SSR 正文，HTML 脚本被过滤', async ({ page }) => {
  const response = await page.goto('/preview/article/resources/8')
  expect(response?.status()).toBe(200)
  expect(await response!.text()).toContain('这是可独立加载的教学正文')
  await expect(page.getByRole('heading', { name: '资源示例 8', exact: true })).toBeVisible()
  await expect(page.locator('.article-detail__recommendations')).toHaveCount(0)
  await expect(page.locator('article script')).toHaveCount(0)
})
test('video 使用 xgplayer 加载', async ({ page }) => {
  await page.goto('/preview/resource/resources/2')
  await waitForHydration(page)
  const host = page.getByTestId('video-preview')
  await expect(host).toBeVisible()
  await expect(host.locator('.xgplayer, video').first()).toBeVisible({ timeout: 15_000 })
})
test('audio 使用 vue-wave-player 加载', async ({ page }) => {
  await page.goto('/preview/resource/resources/3')
  await waitForHydration(page)
  await expect(page.getByTestId('audio-preview')).toBeVisible({ timeout: 15_000 })
})
test('文档通过预览服务 iframe 接入', async ({ page }) => {
  await page.goto('/preview/resource/resources/4')
  await waitForHydration(page)
  const frame = page.getByTestId('document-preview')
  await expect(frame).toBeVisible()
  const src = await frame.getAttribute('src')
  expect(src).toContain('8.133.231.181:11001')
  expect(src).toContain('showImport=0')
  expect(src).toMatch(/[?&]url=/)
  expect(decodeURIComponent(src!)).toContain('/media/sample.pdf')
})
test('图片使用轮播展示，预览工具栏不再提供全屏查看', async ({ page }) => {
  await page.goto('/preview/resource/resources/5')
  await waitForHydration(page)
  await expect(page.getByTestId('image-carousel')).toBeVisible()
  await expect
    .poll(() =>
      page
        .locator('.resource-gallery__image')
        .evaluate((element: HTMLImageElement) => element.naturalWidth),
    )
    .toBeGreaterThan(0)
  await expect(page.locator('.preview-frame__toolbar').getByRole('button')).toHaveCount(0)
})
test('PPT 走文档预览服务，失效媒体可重试', async ({ page }) => {
  await page.goto('/preview/resource/resources/6')
  await waitForHydration(page)
  const frame = page.getByTestId('document-preview')
  await expect(frame).toBeVisible()
  expect(decodeURIComponent((await frame.getAttribute('src'))!)).toContain('/media/slides.pptx')
  await page.goto('/preview/resource/resources/9')
  await waitForHydration(page)
  await expect(page.getByRole('button', { name: /重\s*试/, exact: true })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: /重\s*试/, exact: true }).click()
  await expect(page.getByRole('button', { name: /重\s*试/, exact: true })).toBeVisible()
})
